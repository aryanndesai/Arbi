import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import { getRequestsForUser, getTripsForUser } from "@/db/queries";

type Tab = "trips" | "requests";

function isTab(value: string | undefined): value is Tab {
  return value === "trips" || value === "requests";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: string | null): { label: string; cls: string } {
  switch (status) {
    case "accepted":
      return { label: "Accepted", cls: "bg-green-100 text-green-800 border-green-200" };
    case "declined":
      return { label: "Declined", cls: "bg-gray-100 text-gray-700 border-gray-200" };
    case "completed":
      return { label: "Completed", cls: "bg-blue-100 text-blue-800 border-blue-200" };
    case "in_transit":
      return { label: "In transit", cls: "bg-purple-100 text-purple-800 border-purple-200" };
    case "full":
      return { label: "Full", cls: "bg-amber-100 text-amber-800 border-amber-200" };
    case "open":
      return { label: "Open", cls: "bg-amber-100 text-amber-800 border-amber-200" };
    case "pending":
    default:
      return { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-200" };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const tab: Tab = isTab(params.tab) ? params.tab : "trips";

  const [trips, requests] = await Promise.all([
    getTripsForUser(userId),
    getRequestsForUser(userId),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 animate-arbi-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back.</p>

        <div className="mt-8 inline-flex rounded-full border border-gray-200 p-1 bg-gray-50 text-sm">
          <Link
            href="/dashboard?tab=trips"
            className={`px-4 py-1.5 rounded-full transition-colors ${
              tab === "trips"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My trips ({trips.length})
          </Link>
          <Link
            href="/dashboard?tab=requests"
            className={`px-4 py-1.5 rounded-full transition-colors ${
              tab === "requests"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My requests ({requests.length})
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        {tab === "trips" ? (
          trips.length === 0 ? (
            <EmptyState
              emoji="✈️"
              title="You haven't posted any trips yet"
              body="Post a trip to start earning courier fees on your spare luggage."
              cta={{ href: "/post-trip", label: "Post your first trip →" }}
            />
          ) : (
            <ul className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
              {trips.map((trip) => {
                const badge = statusBadge(trip.status);
                return (
                  <li key={trip.id}>
                    <Link
                      href={`/trips/${trip.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-lg">
                          <span>{trip.fromFlag ?? "🌍"}</span>
                          <span className="text-gray-300 text-sm">→</span>
                          <span>{trip.toFlag ?? "🌍"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {trip.fromCountry} → {trip.toCountry}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(trip.departureDate)} · {trip.capacityKg}kg available
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        ) : requests.length === 0 ? (
          <EmptyState
            emoji="🛍️"
            title="You haven't made any requests yet"
            body="Find a traveler heading where you need an item from."
            cta={{ href: "/trips", label: "Browse open trips →" }}
          />
        ) : (
          <ul className="border border-gray-100 rounded-2xl divide-y divide-gray-100">
            {requests.map((r) => {
              const badge = statusBadge(r.status);
              return (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.itemName}
                    </p>
                    {r.itemUrl && (
                      <a
                        href={r.itemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-500 underline hover:text-gray-900"
                      >
                        Item link
                      </a>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      ${r.maxBudget}
                    </p>
                    <p className="text-xs text-gray-500">
                      + ${r.courierFee ?? "0"} fee
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState({
  title,
  body,
  cta,
  emoji,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
  emoji?: string;
}) {
  return (
    <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50/50 to-white">
      {emoji && <div className="text-5xl mb-3">{emoji}</div>}
      <p className="text-gray-800 font-semibold mb-1">{title}</p>
      <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">{body}</p>
      <Link
        href={cta.href}
        className="inline-block px-5 py-2.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
      >
        {cta.label}
      </Link>
    </div>
  );
}
