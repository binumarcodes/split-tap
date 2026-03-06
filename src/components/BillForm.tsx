"use client";

import { useState } from "react";
import { Participant } from "@/types";
import { splitBill } from "@/lib/split";
import SplitResult from "./SplitResult";

export default function BillForm() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const addParticipant = () => {
    if (!name || !amount) return;

    setParticipants([
      ...participants,
      { name, amountPaid: Number(amount) },
    ]);

    setName("");
    setAmount("");
  };

  const handleSplit = () => {
    const result = splitBill(participants);
    setResults(result);
  };

  return (
    <div className="space-y-4">

      <div className="flex gap-2">
        <input
          placeholder="Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Amount Paid"
          type="number"
          className="border p-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={addParticipant}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Add
        </button>
      </div>

      <button
        onClick={handleSplit}
        className="bg-green-600 text-white px-4 py-2"
      >
        Split Bill
      </button>

      <SplitResult results={results} />
    </div>
  );
}