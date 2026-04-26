"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { UserMode } from "@/types";

type ToastState = {
  key: number;
  message: string;
  closing: boolean;
};

export default function ModeToggle() {
  const [mode, setMode] = useState<UserMode>("travelling");
  const [toast, setToast] = useState<ToastState | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (removeTimer.current) clearTimeout(removeTimer.current);
    };
  }, []);

  function switchMode(next: UserMode) {
    if (next === mode) return;
    setMode(next);

    const message =
      next === "travelling"
        ? "You're now in Traveller mode ✈️"
        : "You're now in Shopper mode 🛍️";

    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (removeTimer.current) clearTimeout(removeTimer.current);

    setToast({ key: Date.now(), message, closing: false });
    closeTimer.current = setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, closing: true } : prev));
      removeTimer.current = setTimeout(() => setToast(null), 240);
    }, 2500);
  }

  return (
    <>
      <div
        role="tablist"
        aria-label="Switch between traveller and shopper modes"
        className="relative inline-flex items-center"
      >
        <span
          aria-hidden
          className={`absolute top-0 left-0 h-full rounded-full bg-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            mode === "shopping" ? "translate-x-full" : "translate-x-0"
          }`}
          style={{ width: "50%" }}
        />
        <button
          type="button"
          role="tab"
          aria-selected={mode === "travelling"}
          onClick={() => switchMode("travelling")}
          className={`relative z-10 w-[88px] sm:w-[96px] px-3 py-1.5 rounded-full transition-colors duration-200 ${
            mode === "travelling"
              ? "text-white"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Travelling
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "shopping"}
          onClick={() => switchMode("shopping")}
          className={`relative z-10 w-[88px] sm:w-[96px] px-3 py-1.5 rounded-full transition-colors duration-200 ${
            mode === "shopping"
              ? "text-white"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Shopping
        </button>
      </div>

      {toast && typeof document !== "undefined"
        ? createPortal(
            <div
              key={toast.key}
              role="status"
              aria-live="polite"
              className={`fixed left-1/2 top-5 z-50 -translate-x-1/2 ${
                toast.closing
                  ? "animate-arbi-toast-out"
                  : "animate-arbi-toast-in"
              }`}
            >
              <div className="px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg shadow-black/10">
                {toast.message}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
