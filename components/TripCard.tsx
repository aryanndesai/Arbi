import type { Trip } from "@/types";

type TripCardProps = {
  trip: Trip;
};

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          {trip.traveler.initials}
        </div>
        <span className="text-xs text-gray-400">{trip.date}</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{trip.fromFlag}</span>
        <span className="text-gray-300">→</span>
        <span className="text-lg">{trip.toFlag}</span>
        <span className="text-sm text-gray-600 ml-1">{trip.route}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{trip.capacity} available</span>
        <button className="text-xs px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800">
          Request item
        </button>
      </div>
    </div>
  );
}
