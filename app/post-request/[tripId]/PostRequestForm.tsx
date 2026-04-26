"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  tripId: string;
};

export default function PostRequestForm({ tripId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    itemName: "",
    itemUrl: "",
    maxBudget: 100,
    courierFee: 20,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, ...form }),
      });
      if (!res.ok) throw new Error("Failed to submit request");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Item name">
        <input
          required
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          placeholder="Maison Margiela Tabi flats"
          className="input"
        />
      </Field>

      <Field label="Item URL">
        <input
          required
          type="url"
          value={form.itemUrl}
          onChange={(e) => setForm({ ...form, itemUrl: e.target.value })}
          placeholder="https://"
          className="input"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Max budget (USD)">
          <input
            required
            type="number"
            min={1}
            value={form.maxBudget}
            onChange={(e) =>
              setForm({ ...form, maxBudget: Number(e.target.value) })
            }
            className="input"
          />
        </Field>
        <Field label="Courier fee (USD)">
          <input
            required
            type="number"
            min={0}
            value={form.courierFee}
            onChange={(e) =>
              setForm({ ...form, courierFee: Number(e.target.value) })
            }
            className="input"
          />
        </Field>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
        <Link
          href={`/trips/${tripId}`}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
          background: white;
          outline: none;
        }
        .input:focus { border-color: rgb(17 24 39); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
