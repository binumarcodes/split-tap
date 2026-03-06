"use client";

import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";

type Person = {
  name: string;
  paid: number;
};

export default function Home() {

  const [title, setTitle] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [paid, setPaid] = useState<number | "">("");
  const [result, setResult] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  const addPerson = () => {

    if (!name || paid === "") return;

    setPeople([
      ...people,
      { name, paid: Number(paid) }
    ]);

    setName("");
    setPaid("");

  };

  const removePerson = (index: number) => {

    setPeople(
      people.filter((_, i) => i !== index)
    );

  };

  const calculateSplit = () => {

    if (people.length === 0) return;

    const total = people.reduce((sum, p) => sum + p.paid, 0);
    const share = total / people.length;

    const balances = people.map((p) => ({
      name: p.name,
      balance: p.paid - share
    }));

    const debtors = balances.filter((p) => p.balance < 0);
    const creditors = balances.filter((p) => p.balance > 0);

    const transactions: string[] = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {

      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(
        Math.abs(debtor.balance),
        creditor.balance
      );

      transactions.push(
        `${debtor.name} → ${creditor.name} ₦${amount.toFixed(2)}`
      );

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;

    }

    setResult(transactions);

    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

  };

  const copyMessage = () => {

    const message =
`Split for: ${title}

${result.join("\n")}`;

    navigator.clipboard.writeText(message);

    alert("Copied!");

  };

  const total = people.reduce((sum, p) => sum + p.paid, 0);

  return (

    <main className="min-h-screen bg-[#f5f5f7] flex justify-center py-16 px-4">

      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
        />
      )}

      <div className="w-full max-w-xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl rounded-[32px] p-8">

        {/* Logo Section */}

        <div className="flex flex-col items-center mb-8">

          <Image
            src="/logo.png"
            alt="Split & Tap Logo"
            width={190}
            height={190}
            className="rounded-[24px] shadow-lg hover:scale-105 transition mb-4"
          />

          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Split & Tap
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Smart bill splitting
          </p>

        </div>

        {/* Bill Title */}

        <input
          placeholder="Dinner at restaurant..."
          className="w-full p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 mb-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Add Person */}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <input
            placeholder="Name"
            className="flex-1 p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Amount"
            type="number"
            className="flex-1 p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 hover:shadow-md transition"
            >

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                  {p.name.charAt(0).toUpperCase()}
                </div>

                <span className="text-gray-900">
                  {p.name}
                </span>

              </div>

              <div className="flex items-center gap-4">

                <span className="font-medium text-gray-800">
                  ₦{p.paid}
                </span>

                <button
                  onClick={() => removePerson(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Total */}

        <div className="flex justify-between text-gray-600 mb-6">

          <span>Total</span>

          <span className="font-semibold text-gray-900">
            ₦{total.toFixed(2)}
          </span>

        </div>

        {/* Split Button */}

        <button
          onClick={calculateSplit}
          className="w-full py-4 rounded-2xl bg-black text-white font-semibold hover:scale-[1.02] hover:opacity-90 transition"
        >
          Split Bill
        </button>

        {/* Results */}

        {result.length > 0 && (

          <div className="mt-8 space-y-3">

            <h2 className="text-gray-900 font-semibold">
              Settlement
            </h2>

            {result.map((r, i) => (

              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-800"
              >
                {r}
              </div>

            ))}

            <button
              onClick={copyMessage}
              className="w-full py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition"
            >
              Copy Payment Message
            </button>

            <div className="flex flex-col items-center mt-6">

              <p className="text-sm text-gray-500 mb-2">
                Share with QR
              </p>

              <QRCodeCanvas
                value={result.join("\n")}
                size={150}
              />

            </div>

          </div>

        )}

      </div>

    </main>

  );

}