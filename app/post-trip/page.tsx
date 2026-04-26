"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { getCountryFlag } from "@/lib/country-style";

export default function PostTripPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fromCountry: "",
    toCountry: "",
    departureDate: "",
    returnDate: "",
    capacityKg: 3,
  });

  const fromFlag = form.fromCountry ? getCountryFlag(form.fromCountry) : "";
  const toFlag = form.toCountry ? getCountryFlag(form.toCountry) : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to post trip");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-xl mx-auto px-6 pt-12 pb-20 animate-arbi-fade-in">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-900">
          ← Home
        </Link>

        <div className="mt-5 mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-[10px]">
            1
          </span>
          <span>Step 1 of 1 — Trip details</span>
        </div>
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden mb-8">
          <div className="h-full w-full bg-black rounded-full" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Post a trip ✈️
        </h1>
        <p className="text-gray-500 mb-10">
          Tell buyers where you&apos;re going and how much capacity you have.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="From country"
              tip="Where you're flying from. The flag will appear automatically."
            >
              <FlagInput
                flag={fromFlag}
                value={form.fromCountry}
                onChange={(v) => setForm({ ...form, fromCountry: v })}
                placeholder="e.g. Singapore"
              />
            </Field>
            <Field
              label="To country"
              tip="Your destination. Buyers filter by this."
            >
              <FlagInput
                flag={toFlag}
                value={form.toCountry}
                onChange={(v) => setForm({ ...form, toCountry: v })}
                placeholder="e.g. Japan"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Departure date" tip="When you fly out.">
              <input
                required
                type="date"
                value={form.departureDate}
                onChange={(e) =>
                  setForm({ ...form, departureDate: e.target.value })
                }
                className="arbi-input"
              />
            </Field>
            <Field
              label="Return date"
              tip="When you'll be back to deliver items."
            >
              <input
                required
                type="date"
                value={form.returnDate}
                onChange={(e) =>
                  setForm({ ...form, returnDate: e.target.value })
                }
                className="arbi-input"
              />
            </Field>
          </div>

          <Field
            label="Luggage capacity (kg)"
            tip="Most travellers offer 2–6kg. Heavier = more requests."
          >
            <input
              required
              type="number"
              min={1}
              max={30}
              value={form.capacityKg}
              onChange={(e) =>
                setForm({ ...form, capacityKg: Number(e.target.value) })
              }
              className="arbi-input"
              placeholder="3"
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-3.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {submitting ? "Posting…" : "Post trip"}
            </button>
            <Link
              href="/trips"
              className="px-7 py-3.5 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800 mb-1.5">
        {label}
      </span>
      {children}
      {tip && <span className="block mt-1.5 text-xs text-gray-500">{tip}</span>}
    </label>
  );
}

function FlagInput({
  flag,
  value,
  onChange,
  placeholder,
}: {
  flag: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {flag && (
        <span
          aria-hidden
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
        >
          {flag}
        </span>
      )}
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`arbi-input ${flag ? "pl-12" : ""}`}
      />
    </div>
  );
}
