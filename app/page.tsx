import Navbar from "@/components/Navbar";
import TripCard from "@/components/TripCard";
import type { Trip } from "@/types";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
          Turn your spare luggage into cash
        </h2>
        <p className="text-lg text-gray-500 mb-8">
          Travelers post trips. Buyers attach requests. Everyone wins.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800">
            Post a trip
          </button>
          <button className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50">
            Browse trips
          </button>
        </div>
      </section>

      {/* trip cards */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-6">
          Open trips
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}

// mock data so we can see something real
const trips: Trip[] = [
  {
    id: 1,
    traveler: { id: 1, name: "Alyssa See", initials: "AS", mode: "travelling" },
    fromCountry: "Singapore",
    toCountry: "France",
    fromFlag: "🇸🇬",
    toFlag: "🇫🇷",
    route: "SG → Paris",
    date: "May 12",
    capacity: "3kg",
  },
  {
    id: 2,
    traveler: { id: 2, name: "Jun Kai", initials: "JK", mode: "travelling" },
    fromCountry: "Singapore",
    toCountry: "Japan",
    fromFlag: "🇸🇬",
    toFlag: "🇯🇵",
    route: "SG → Tokyo",
    date: "May 15",
    capacity: "5kg",
  },
  {
    id: 3,
    traveler: { id: 3, name: "Mina Rahman", initials: "MR", mode: "travelling" },
    fromCountry: "Singapore",
    toCountry: "United Kingdom",
    fromFlag: "🇸🇬",
    toFlag: "🇬🇧",
    route: "SG → London",
    date: "May 20",
    capacity: "2kg",
  },
  {
    id: 4,
    traveler: { id: 4, name: "Paul Lee", initials: "PL", mode: "travelling" },
    fromCountry: "United States",
    toCountry: "France",
    fromFlag: "🇺🇸",
    toFlag: "🇫🇷",
    route: "NY → Paris",
    date: "May 18",
    capacity: "4kg",
  },
  {
    id: 5,
    traveler: { id: 5, name: "Yumi Tan", initials: "YT", mode: "travelling" },
    fromCountry: "Australia",
    toCountry: "Japan",
    fromFlag: "🇦🇺",
    toFlag: "🇯🇵",
    route: "SYD → Tokyo",
    date: "May 22",
    capacity: "6kg",
  },
  {
    id: 6,
    traveler: { id: 6, name: "Byun Na", initials: "BN", mode: "travelling" },
    fromCountry: "South Korea",
    toCountry: "France",
    fromFlag: "🇰🇷",
    toFlag: "🇫🇷",
    route: "Seoul → Paris",
    date: "May 25",
    capacity: "3kg",
  },
];
