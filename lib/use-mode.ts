"use client";

import { useSyncExternalStore } from "react";
import type { UserMode } from "@/types";

export const MODE_STORAGE_KEY = "arbi:mode";
export const MODE_CHANGE_EVENT = "arbi:mode-change";

function readMode(): UserMode {
  if (typeof window === "undefined") return "travelling";
  const v = window.localStorage.getItem(MODE_STORAGE_KEY);
  return v === "shopping" ? "shopping" : "travelling";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(MODE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(MODE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// SSR returns "travelling" (the default) — hydration matches
// Client reads localStorage and re-renders if different
export function useMode(): UserMode {
  return useSyncExternalStore(subscribe, readMode, () => "travelling");
}

export function setMode(next: UserMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_STORAGE_KEY, next);
  window.dispatchEvent(new CustomEvent(MODE_CHANGE_EVENT, { detail: next }));
}
