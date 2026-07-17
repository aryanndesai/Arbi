type Signal = {
  icon: string;
  title: string;
  body: string;
};

const SIGNALS: Signal[] = [
  {
    icon: "🔒",
    title: "Escrow payments",
    body: "Your money is held safely and only released once the item is delivered.",
  },
  {
    icon: "✅",
    title: "Verified travelers",
    body: "Every traveler is identity checked before they can accept a request.",
  },
  {
    icon: "↩️",
    title: "Money-back guarantee",
    body: "If your item never arrives, you get a full refund. No questions asked.",
  },
];

export default function TrustSignals() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-2 pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SIGNALS.map((s) => (
          <div
            key={s.title}
            className="flex items-start gap-3 rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-gray-50/30 to-white"
          >
            <span
              aria-hidden
              className="shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg"
            >
              {s.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
