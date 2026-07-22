import { getCountryFlag } from "@/lib/country-style";

type RecentMatch = {
  id: string;
  from: string;
  to: string;
  item: string;
  fee: number;
  buyerInitials: string;
  travelerInitials: string;
};

// Sample activity for social proof. Clearly labelled as sample until real
// matches exist. Replaced by a live query once matches are persisted (Day 6).
const SAMPLE_MATCHES: RecentMatch[] = [
  {
    id: "sm_1",
    from: "Singapore",
    to: "Japan",
    item: "Onitsuka Tiger Mexico 66",
    fee: 25,
    buyerInitials: "PL",
    travelerInitials: "JK",
  },
  {
    id: "sm_2",
    from: "France",
    to: "Singapore",
    item: "Diptyque candle 190g",
    fee: 20,
    buyerInitials: "YT",
    travelerInitials: "AS",
  },
  {
    id: "sm_3",
    from: "South Korea",
    to: "Australia",
    item: "Laneige lip mask set",
    fee: 15,
    buyerInitials: "MR",
    travelerInitials: "BN",
  },
];

export default function RecentMatches() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-8 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Recent matches
        </h2>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
          Sample
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SAMPLE_MATCHES.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-gray-50/30 to-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{getCountryFlag(m.from)}</span>
              <span className="text-gray-300">→</span>
              <span className="text-lg">{getCountryFlag(m.to)}</span>
              <span className="text-xs text-gray-500 ml-1 truncate">
                {m.from} → {m.to}
              </span>
            </div>

            <p className="text-sm font-medium text-gray-900 truncate">
              {m.item}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[10px] font-medium text-gray-600">
                  {m.buyerInitials}
                </span>
                <span className="w-6 h-6 rounded-full bg-gray-900 border border-white flex items-center justify-center text-[10px] font-medium text-white">
                  {m.travelerInitials}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                <span className="text-green-700 font-medium">matched</span> · $
                {m.fee} fee
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
