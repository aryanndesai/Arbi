import Link from "next/link";

type Step = { num: number; emoji: string; title: string; body: string };

const TRAVELLER_STEPS: Step[] = [
  {
    num: 1,
    emoji: "✈️",
    title: "Post your trip",
    body: "Share where you're going and how much space you have.",
  },
  {
    num: 2,
    emoji: "📥",
    title: "Accept requests",
    body: "Buyers attach items they want — you choose which ones to take.",
  },
  {
    num: 3,
    emoji: "💸",
    title: "Earn on arrival",
    body: "Deliver the item, buyer confirms, money hits your account.",
  },
];

const SHOPPER_STEPS: Step[] = [
  {
    num: 1,
    emoji: "🌍",
    title: "Browse trips",
    body: "Find someone heading to the country you need.",
  },
  {
    num: 2,
    emoji: "📝",
    title: "Attach your request",
    body: "Tell them exactly what you want and your budget.",
  },
  {
    num: 3,
    emoji: "📦",
    title: "Receive and save",
    body: "Get the real item at local prices — save hundreds.",
  },
];

function StepRow({ step }: { step: Step }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
        {step.emoji}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          <span className="text-gray-400 mr-1.5">{step.num}.</span>
          {step.title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{step.body}</p>
      </div>
    </div>
  );
}

function Card({
  title,
  steps,
  cta,
}: {
  title: string;
  steps: Step[];
  cta: { href: string; label: string };
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-gray-50/30 to-white">
      <h3 className="text-xl font-bold text-gray-900 mb-5">{title}</h3>
      <div className="space-y-4 mb-6">
        {steps.map((s) => (
          <StepRow key={s.num} step={s} />
        ))}
      </div>
      <Link
        href={cta.href}
        className="inline-block px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide text-center mb-6">
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Travelling somewhere? ✈️"
          steps={TRAVELLER_STEPS}
          cta={{ href: "/post-trip", label: "Post a trip →" }}
        />
        <Card
          title="Want something from abroad? 🛍️"
          steps={SHOPPER_STEPS}
          cta={{ href: "/trips", label: "Browse trips →" }}
        />
      </div>
    </section>
  );
}
