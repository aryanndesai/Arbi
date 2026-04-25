import Link from "next/link";
import type { Trip } from "@/types";
import { getCountryStyle } from "@/lib/country-style";

type TripCardProps = {
  trip: Trip;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TripCard({ trip }: TripCardProps) {
  const destStyle = getCountryStyle(trip.toCountry);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={`group relative block rounded-2xl p-5 border ${destStyle.borderClass} ${destStyle.tintClass} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
    >
      {trip.requests.length > 0 && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          {trip.requests.length} request{trip.requests.length === 1 ? "" : "s"}
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/80 border border-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
            {trip.traveler.avatarInitials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {trip.traveler.fullName}
            </p>
            <p className="text-xs text-gray-500">
              ★ {trip.traveler.travelerRating.toFixed(1)} ·{" "}
              {trip.traveler.tripsCompleted} trip
              {trip.traveler.tripsCompleted === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{trip.fromFlag}</span>
        <span className="text-gray-300">→</span>
        <span className="text-lg">{trip.toFlag}</span>
        <span className="text-sm text-gray-700 ml-1 truncate">
          {trip.fromCountry} → {trip.toCountry}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {trip.capacityKg}kg available · {formatDate(trip.departureDate)}
        </span>
        <span className="text-xs px-3 py-1.5 bg-black text-white rounded-full transition-transform duration-200 group-hover:scale-110">
          View
        </span>
      </div>
    </Link>
  );
}
