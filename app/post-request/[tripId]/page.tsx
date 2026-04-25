import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostRequestForm from "@/app/post-request/[tripId]/PostRequestForm";
import { getTripById } from "@/lib/mock-data";

export default async function PostRequestPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await getTripById(tripId);
  if (!trip) notFound();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-xl mx-auto px-6 pt-12 pb-20 animate-arbi-fade-in">
        <Link
          href={`/trips/${trip.id}`}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          ← Back to trip
        </Link>

        <div className="mt-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Request an item
          </h1>
          <p className="text-gray-500">
            Attaching to{" "}
            <span className="font-medium text-gray-900">
              {trip.traveler.fullName}
            </span>
            &apos;s trip — {trip.fromFlag} {trip.fromCountry} →{" "}
            {trip.toFlag} {trip.toCountry}.
          </p>
        </div>

        <PostRequestForm tripId={trip.id} />
      </section>
    </main>
  );
}
