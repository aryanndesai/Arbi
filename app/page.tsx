export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Arbi</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Log in
          </button>
          <button className="px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800">
            Sign up
          </button>
        </div>
      </nav>

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
            <div key={trip.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {trip.initials}
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
          ))}
        </div>
      </section>

    </main>
  )
}

// mock data so we can see something real
const trips = [
  { id: 1, initials: "AS", fromFlag: "🇸🇬", toFlag: "🇫🇷", route: "SG → Paris", date: "May 12", capacity: "3kg", },
  { id: 2, initials: "JK", fromFlag: "🇸🇬", toFlag: "🇯🇵", route: "SG → Tokyo", date: "May 15", capacity: "5kg", },
  { id: 3, initials: "MR", fromFlag: "🇸🇬", toFlag: "🇬🇧", route: "SG → London", date: "May 20", capacity: "2kg", },
  { id: 4, initials: "PL", fromFlag: "🇺🇸", toFlag: "🇫🇷", route: "NY → Paris", date: "May 18", capacity: "4kg", },
  { id: 5, initials: "YT", fromFlag: "🇦🇺", toFlag: "🇯🇵", route: "SYD → Tokyo", date: "May 22", capacity: "6kg", },
  { id: 6, initials: "BN", fromFlag: "🇰🇷", toFlag: "🇫🇷", route: "Seoul → Paris", date: "May 25", capacity: "3kg", },
]
