import Navbar from "@/components/Navbar";
import TripCardSkeleton from "@/components/TripCardSkeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-6">
        <div className="h-8 w-48 rounded arbi-skeleton mb-3" />
        <div className="h-4 w-72 rounded arbi-skeleton mb-6" />
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-24 rounded-full arbi-skeleton"
            />
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
