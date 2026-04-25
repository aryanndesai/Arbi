import Link from "next/link";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import {
  getCurrentUserId,
  getRequestsForUser,
  getTripsForUser,
  getUserById,
} from "@/lib/mock-data";
import type { ItemRequest } from "@/types";

type Tab = "trips" | "requests";

function isTab(value: string | undefined): value is Tab {
  return value === "trips" || value === "requests";
}

function formatStatus(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

function RequestRow({ request }: { request: ItemRequest }) {
  return (
    <li className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {request.itemName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Trip {request.tripId} ·{" "}
          <a
            href={request.itemUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-900"
          >
            Item link
          </a>
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-900">
          ${request.maxBudget}
        </p>
        <p className="text-xs text-gray-500">+${request.courierFee} fee</p>
        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-gray-500">
          {formatStatus(request.status)}
        </span>
      </div>
    </li>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const userId = getCurrentUserId();
  const params = await searchParams;
  const tab: Tab = isTab(params.tab) ? params.tab : "trips";

  const [user, trips, requests] = await Promise.all([
    getUserById(userId),
    getTripsForUser(userId),
    getRequestsForUser(userId),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 animate-arbi-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {user && (
          <p className="text-gray-500 mt-1">
            Welcome back, {user.fullName.split(" ")[0]}.
          </p>
        )}

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
              title="No trips yet"
              body="Post a trip to start earning courier fees on your spare luggage."
              cta={{ href: "/post-trip", label: "Post a trip" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )
        ) : requests.length === 0 ? (
          <EmptyState
            emoji="🛍️"
            title="No requests yet"
            body="Browse open trips and attach an item request to one."
            cta={{ href: "/trips", label: "Browse trips" }}
          />
        ) : (
          <ul className="border border-gray-100 rounded-2xl px-4">
            {requests.map((r) => (
              <RequestRow key={r.id} request={r} />
            ))}
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
