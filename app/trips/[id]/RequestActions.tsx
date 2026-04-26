"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "accepted" | "declined" | "completed" | string;

type Props = {
  requestId: string;
  initialStatus: Status;
};

const BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 border-amber-200",
  accepted:  "bg-green-100 text-green-800 border-green-200",
  declined:  "bg-gray-100 text-gray-700 border-gray-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

function statusLabel(s: Status): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function RequestActions({ requestId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function update(next: "accepted" | "declined") {
    setError(null);
    const previous = status;
    setStatus(next);

    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus(previous);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
          BADGE[status] ?? BADGE.pending
        }`}
      >
        {statusLabel(status)}
      </span>
      {status === "pending" && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={pending}
            onClick={() => update("accepted")}
            className="text-xs px-2.5 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            Accept ✓
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => update("declined")}
            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-60"
          >
            Decline ✗
          </button>
        </div>
      )}
      {error && (
        <span className="text-[10px] text-red-600">{error}</span>
      )}
    </div>
  );
}
