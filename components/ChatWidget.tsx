"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const HARDCODED_REPLY =
  "Thanks for reaching out! Our team will get back to you soon. In the meantime, browse our open trips.";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 0,
    role: "assistant",
    text: "Hi! I'm Arbi's assistant ✨ — ask me anything about trips, requests, or how the marketplace works.",
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);

    // TODO: replace with Claude API call
    await new Promise((resolve) => setTimeout(resolve, 600));
    const reply: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: HARDCODED_REPLY,
    };
    setMessages((prev) => [...prev, reply]);
    setSending(false);
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open Arbi assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-black text-white shadow-lg shadow-black/20 hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        >
          <ChatBubbleIcon className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Arbi Assistant"
          className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-black/10 flex flex-col overflow-hidden animate-arbi-slide-up"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                ✨
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900">
                  Arbi Assistant
                </p>
                <p className="text-[11px] text-gray-500">Usually replies fast</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center transition-colors"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-black text-white rounded-br-md"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-bl-md px-3.5 py-2 text-sm">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-gray-100 p-3 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-gray-50 focus:ring-2 focus:ring-black/10 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              aria-label="Send message"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12l14-7-7 14-2-5-5-2z" />
    </svg>
  );
}
