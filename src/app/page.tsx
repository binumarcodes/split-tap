"use client";

import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";

type Person = {
  name: string;
  paid: number;
  timestamp: string;
  settled: boolean;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [paid, setPaid] = useState<number | "">("");
  const [result, setResult] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [darkMode, setDarkMode] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null); // Scroll to results

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  // Auto-scroll whenever results appear
  useEffect(() => {
    if (result.length > 0) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addPerson = () => {
    if (!name || paid === "") return;
    setPeople([
      ...people,
      { name, paid: Number(paid), timestamp: new Date().toLocaleString(), settled: false },
    ]);
    setName("");
    setPaid("");
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const toggleSettled = (index: number) => {
    setPeople(
      people.map((p, i) => (i === index ? { ...p, settled: !p.settled } : p))
    );
  };

  const calculateSplit = () => {
    if (people.length === 0) return;

    const total = people.reduce((sum, p) => sum + p.paid, 0);
    const share = total / people.length;

    const balances = people.map((p) => ({
      name: p.name,
      balance: p.paid - share,
    }));

    const debtors = balances.filter((p) => p.balance < 0);
    const creditors = balances.filter((p) => p.balance > 0);

    const transactions: string[] = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

      transactions.push(`${debtor.name} → ${creditor.name} ₦${amount.toFixed(2)}`);

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    setResult(transactions);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const getFullMessage = () => {
    const history = people.map((p) => `${p.name} paid ₦${p.paid} (${p.timestamp})`).join("\n");
    return `Split for: ${title}\n\nSettlement:\n${result.join("\n")}\n\nHistory:\n${history}`;
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(getFullMessage());
    alert("Copied!");
  };

  const total = people.reduce((sum, p) => sum + p.paid, 0);

  return (
    <main className={`${darkMode ? "bg-gray-900 text-white" : "bg-[#f5f5f7] text-gray-900"} min-h-screen flex justify-center py-16 px-4 transition-colors`}>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}

      <div className={`w-full max-w-xl ${darkMode ? "bg-gray-800/60 border-gray-700" : "bg-white/60 border-gray-200"} backdrop-blur-3xl border shadow-xl rounded-[32px] p-8 transition-colors`}>

        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 border rounded-full hover:opacity-90 transition bg-white/30 dark:bg-gray-400/30 backdrop-blur"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Split & Tap Logo"
            width={190}
            height={190}
            className="rounded-[24px] shadow-lg hover:scale-105 transition mb-4"
          />
          <h1 className="text-3xl font-semibold tracking-tight">Split & Tap</h1>
          <p className="text-sm mt-1">Smart bill splitting</p>
        </div>

        {/* Bill Title */}
        <input
          placeholder="Dinner at restaurant..."
          className={`w-full p-4 rounded-2xl border ${darkMode ? "bg-gray-700/40 border-gray-600 text-white placeholder-gray-300" : "bg-white/40 border-gray-200 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-gray-300 mb-6 backdrop-blur transition`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Add Person */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            placeholder="Name"
            className={`flex-1 p-4 rounded-2xl border ${darkMode ? "bg-gray-700/40 border-gray-600 text-white placeholder-gray-300" : "bg-white/40 border-gray-200 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-gray-300 backdrop-blur transition`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Amount"
            type="number"
            className={`flex-1 p-4 rounded-2xl border ${darkMode ? "bg-gray-700/40 border-gray-600 text-white placeholder-gray-300" : "bg-white/40 border-gray-200 text-gray-900 placeholder-gray-500"} focus:outline-none focus:ring-2 focus:ring-gray-300 backdrop-blur transition`}
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value))}
          />
          <button
            onClick={addPerson}
            className="px-6 py-4 rounded-2xl bg-black text-white font-medium hover:scale-105 hover:opacity-90 transition"
          >
            Add
          </button>
        </div>

        {/* Participants */}
        <div className="space-y-3 mb-6">
          {people.map((p, i) => (
            <div
              key={i}
              className={`flex justify-between items-center border-2 ${darkMode ? "bg-gray-700/40 border-gray-600" : "bg-white/40 border-gray-200"} rounded-2xl px-4 py-3 hover:shadow-md backdrop-blur transition`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span>{p.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>₦{p.paid}</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={p.settled} onChange={() => toggleSettled(i)} />
                  Paid
                </label>
                <button onClick={() => removePerson(i)} className="text-gray-400 hover:text-red-500">✕</button>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between text-gray-600 mb-6">
          <span>Total</span>
          <span className="font-semibold">₦{total.toFixed(2)}</span>
        </div>

        {/* Split Button */}
        <button
          onClick={calculateSplit}
          className="w-full py-4 rounded-2xl bg-black text-white font-semibold hover:scale-[1.02] hover:opacity-90 transition"
        >
          Split Bill
        </button>

        {/* Results + Copy + QR */}
        {result.length > 0 && (
  <div ref={resultRef} className="mt-8 space-y-3 relative">
    {/* Congratulations Banner */}
    <div className="text-center text-2xl font-bold text-green-500 mb-2 animate-bounce">
      🎉 Congratulations! 🎉
    </div>

    {/* Confetti overlayed on the settlement */}
    {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}

    <h2 className="font-semibold">Settlement</h2>
    {result.map((r, i) => (
      <div key={i} className={`${darkMode ? "bg-gray-700/40 border-gray-600 text-white" : "bg-white/40 border-gray-200 text-gray-900"} rounded-2xl p-4 backdrop-blur transition`}>
        {r}
      </div>
    ))}

    <button onClick={copyMessage} className="w-full py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition">
      Copy Payment + History
    </button>

    <div className="flex flex-col items-center mt-6">
      <p className="text-sm mb-2">Share with QR (includes full history)</p>
      <QRCodeCanvas value={getFullMessage()} size={150} />
    </div>
  </div>
)}

        {/* Purchase History */}
        {people.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold mb-2">History</h2>
            <ul className={`${darkMode ? "bg-gray-700/40 border-gray-600 text-white" : "bg-white/40 border-gray-200 text-gray-900"} rounded-2xl p-4 space-y-2 max-h-64 overflow-y-auto backdrop-blur transition`}>
              {people.map((p, i) => (
                <li key={i} className="flex justify-between items-center text-sm">
                  <span>{p.name} paid ₦{p.paid}</span>
                  <span className="text-gray-400">{p.timestamp}</span>
                  <span className={`${p.settled ? "text-green-500" : "text-red-400"}`}>{p.settled ? "✓ Paid" : "❌ Unpaid"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}