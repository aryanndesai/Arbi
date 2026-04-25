import Link from "next/link";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import { getDestinationCountries, getTrips } from "@/lib/mock-data";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const [trips, countries, params] = await Promise.all([
    getTrips(),
    Promise.resolve(getDestinationCountries()),
    searchParams,
  ]);

  const filter = params.to ?? "";
  const filtered = filter
    ? trips.filter((t) => t.toCountry === filter)
    : trips;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6 animate-arbi-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse trips</h1>
        <p className="text-gray-500 mb-6">
          Find a traveler heading where you need an item from.
        </p>

        <div className="flex flex-wrap items-center gap-2 pb-2">
          <Link
            href="/trips"
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !filter
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            All destinations
          </Link>
          {countries.map((country) => (
            <Link
              key={country}
              href={`/trips?to=${encodeURIComponent(country)}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === country
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {country}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50/50 to-white">
            <div className="text-5xl mb-3">🧳</div>
            <p className="text-gray-800 font-semibold mb-1">
              No trips to {filter} yet
            </p>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              Be the first to post a trip on this route — earn courier fees
              and help someone get a hard-to-find item.
            </p>
            <Link
              href="/post-trip"
              className="inline-block px-5 py-2.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Post a trip ✈️
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
