import { Participant, SplitResult } from "@/types";

export function splitBill(participants: Participant[]): SplitResult[] {
  const total = participants.reduce((sum, p) => sum + p.amountPaid, 0);
  const average = total / participants.length;

  const debtors: any[] = [];
  const creditors: any[] = [];

  participants.forEach((p) => {
    const balance = p.amountPaid - average;

    if (balance < 0) {
      debtors.push({ name: p.name, balance: -balance });
    } else if (balance > 0) {
      creditors.push({ name: p.name, balance });
    }
  });

  const results: SplitResult[] = [];

  while (debtors.length && creditors.length) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    const payment = Math.min(debtor.balance, creditor.balance);

    results.push({
      from: debtor.name,
      to: creditor.name,
      amount: Number(payment.toFixed(2)),
    });

    debtor.balance -= payment;
    creditor.balance -= payment;

    if (debtor.balance === 0) debtors.shift();
    if (creditor.balance === 0) creditors.shift();
  }

  return results;
}