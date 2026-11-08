type Signal = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

// Minimal monochrome line icons to match the Navbar SVG style
const shield = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const badgeCheck = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const refund = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 8v4l3 2" />
  </svg>
);

const SIGNALS: Signal[] = [
  {
    title: "Escrow payments",
    body: "Your money is held safely and only released once the item is delivered.",
    icon: shield,
  },
  {
    title: "Verified travelers",
    body: "Every traveler is identity-checked and carries a public rating.",
    icon: badgeCheck,
  },
  {
    title: "Money-back guarantee",
    body: "If your item never arrives, you get a full refund. No arguments.",
    icon: refund,
  },
];

export default function TrustSignals() {
  return (
    <section className="max-w-4xl mx-auto px-6 pb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SIGNALS.map((s) => (
          <div
            key={s.title}
            className="flex items-start gap-3 rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-gray-50/30 to-white"
          >
            <div className="shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
