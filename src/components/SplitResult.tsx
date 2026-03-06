import { SplitResult as Result } from "@/types";

export default function SplitResult({ results }: { results: Result[] }) {
  if (!results.length) return null;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Payments</h2>

      {results.map((r, i) => (
        <div key={i} className="border p-2 mb-2">
          {r.from} pays {r.to} ₦{r.amount}
        </div>
      ))}
    </div>
  );
}