import Link from "next/link";
import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import MapWrapper from "@/components/MapWrapper";
import { getTrips } from "@/lib/mock-data";

export default async function Home() {
  const trips = await getTrips();
  const featured = trips.slice(0, 6);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero text — constrained and centred */}
      <section className="max-w-3xl mx-auto px-6 pt-6 sm:pt-8 pb-8 text-center animate-arbi-fade-in">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] mb-3">
          Turn your spare luggage into cash
        </h2>
        <p className="text-base sm:text-lg text-gray-500">
          Travelers post trips. Buyers attach requests. Everyone wins.
        </p>
      </section>

      {/* Globe — full viewport width, no side constraints */}
      <MapWrapper />

      {/* CTA buttons below the globe */}
      <div className="flex gap-3 justify-center py-8">
        <Link
          href="/post-trip"
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800"
        >
          Post a trip
        </Link>
        <Link
          href="/trips"
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50"
        >
          Browse trips
        </Link>
      </div>

      {/* Open trips grid */}
      <section className="max-w-4xl mx-auto px-6 pt-4 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Open trips
          </h3>
          <Link
            href="/trips"
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            See all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}
