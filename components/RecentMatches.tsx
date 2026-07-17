// Placeholder seed until the matches table has enough real activity to show here.
// Swap this array for a query against `matches` (joined to trips + item_requests)
// once the marketplace has live deliveries. See docs/ROADMAP.md.

type RecentMatch = {
  id: string;
  item: string;
  fromFlag: string;
  toFlag: string;
  route: string;
  saved: number;
  fee: number;
};

const RECENT_MATCHES: RecentMatch[] = [
  {
    id: "rm_1",
    item: "Maison Margiela Tabi flats",
    fromFlag: "🇫🇷",
    toFlag: "🇸🇬",
    route: "Paris to Singapore",
    saved: 210,
    fee: 60,
  },
  {
    id: "rm_2",
    item: "Onitsuka Tiger Mexico 66",
    fromFlag: "🇯🇵",
    toFlag: "🇸🇬",
    route: "Tokyo to Singapore",
    saved: 85,
    fee: 25,
  },
  {
    id: "rm_3",
    item: "Aesop hand balm set",
    fromFlag: "🇬🇧",
    toFlag: "🇦🇺",
    route: "London to Sydney",
    saved: 40,
    fee: 18,
  },
];

export default function RecentMatches() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-4 pb-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Recent matches
        </h2>
        <span className="text-xs text-gray-400">
          Real deliveries, real savings
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {RECENT_MATCHES.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-gray-50/30 to-white"
          >
            <div className="flex items-center gap-2 text-lg mb-3">
              <span>{m.fromFlag}</span>
              <span className="text-gray-300 text-sm">→</span>
              <span>{m.toFlag}</span>
              <span className="text-xs text-gray-500 ml-1 truncate">
                {m.route}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {m.item}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                Buyer saved ${m.saved}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                Traveler earned ${m.fee}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
