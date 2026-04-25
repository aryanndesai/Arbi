import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import {
  getRequestsForUser,
  getTripsForUser,
  getUserById,
} from "@/lib/mock-data";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  const [trips, requests] = await Promise.all([
    getTripsForUser(id),
    getRequestsForUser(id),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 animate-arbi-fade-in">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-900">
          ← Home
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-medium text-gray-600">
            {user.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.fullName}
            </h1>
            <p className="text-sm text-gray-500">Member of Arbi</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <Stat label="Traveler rating" value={`★ ${user.travelerRating.toFixed(1)}`} />
        <Stat label="Buyer rating" value={`★ ${user.buyerRating.toFixed(1)}`} />
        <Stat label="Trips done" value={String(user.tripsCompleted)} />
        <Stat label="Requests done" value={String(user.requestsCompleted)} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-10">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Recent trips
        </h2>
        {trips.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500 bg-gradient-to-br from-gray-50/50 to-white">
            No trips posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Recent requests
        </h2>
        {requests.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center text-sm text-gray-500 bg-gradient-to-br from-gray-50/50 to-white">
            No requests yet.
          </div>
        ) : (
          <ul className="border border-gray-100 rounded-2xl px-4">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.itemName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Trip {r.tripId}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 shrink-0">
                  ${r.maxBudget}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
