import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getTripById } from "@/lib/mock-data";
import type { ItemRequest } from "@/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RequestRow({ request }: { request: ItemRequest }) {
  return (
    <li className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          {request.buyer.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {request.itemName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {request.buyer.fullName} · ★ {request.buyer.buyerRating.toFixed(1)}
          </p>
          <a
            href={request.itemUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-500 underline hover:text-gray-900"
          >
            Item link
          </a>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-gray-900">
          ${request.maxBudget}
        </p>
        <p className="text-xs text-gray-500">
          + ${request.courierFee} fee
        </p>
        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide text-gray-500">
          {request.status}
        </span>
      </div>
    </li>
  );
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTripById(id);
  if (!trip) notFound();

  const totalCommitted = trip.requests.reduce(
    (sum, r) => sum + r.courierFee,
    0
  );

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 pt-12 pb-6 animate-arbi-fade-in">
        <Link
          href="/trips"
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          ← All trips
        </Link>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{trip.fromFlag}</span>
              <span className="text-gray-300 text-2xl">→</span>
              <span className="text-3xl">{trip.toFlag}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {trip.fromCountry} → {trip.toCountry}
            </h1>
            <p className="text-gray-500 mt-1">
              {formatDate(trip.departureDate)} · returning{" "}
              {formatDate(trip.returnDate)}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {trip.status}
          </span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Capacity
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {trip.capacityKg}kg
          </p>
        </div>
        <div className="border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Requests
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {trip.requests.length}
          </p>
        </div>
        <div className="border border-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Fees committed
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            ${totalCommitted}
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl">
          <Link
            href={`/profile/${trip.traveler.id}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
              {trip.traveler.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {trip.traveler.fullName}
              </p>
              <p className="text-xs text-gray-500">
                ★ {trip.traveler.travelerRating.toFixed(1)} ·{" "}
                {trip.traveler.tripsCompleted} trips
              </p>
            </div>
          </Link>
          <Link
            href={`/post-request/${trip.id}`}
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 shrink-0"
          >
            Request item
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Attached requests
        </h2>
        {trip.requests.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gradient-to-br from-gray-50/50 to-white">
            <div className="text-4xl mb-3">🛍️</div>
            <p className="text-gray-800 font-semibold mb-1">No requests yet</p>
            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
              Be the first to attach an item — your traveller is heading there
              soon.
            </p>
            <Link
              href={`/post-request/${trip.id}`}
              className="inline-block px-5 py-2.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Attach a request
            </Link>
          </div>
        ) : (
          <ul className="border border-gray-100 rounded-2xl px-4">
            {trip.requests.map((r) => (
              <RequestRow key={r.id} request={r} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
