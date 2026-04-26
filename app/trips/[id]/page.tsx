import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import RequestActions from "./RequestActions";
import { getTripById as getDbTripById } from "@/db/queries";
import { getTripById as getMockTripById } from "@/lib/mock-data";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 border-amber-200",
  accepted:  "bg-green-100 text-green-800 border-green-200",
  declined:  "bg-gray-100 text-gray-700 border-gray-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

type RawRequest = {
  id: string;
  itemName: string;
  itemUrl: string | null;
  maxBudget: string | number;
  courierFee: string | number | null;
  status: string | null;
  buyerId: string | null;
  buyerName?: string;
  buyerInitials?: string;
  buyerRating?: number;
};

type RawTrip = {
  id: string;
  travelerId: string | null;
  fromCountry: string;
  toCountry: string;
  fromFlag: string | null;
  toFlag: string | null;
  departureDate: string;
  returnDate: string | null;
  capacityKg: string | number;
  status: string | null;
  travelerName: string;
  travelerInitials: string | null;
  travelerRating?: number;
  travelerTripsCompleted?: number;
  requests: RawRequest[];
};

async function loadTrip(id: string): Promise<RawTrip | null> {
  // Try the real DB first
  try {
    const dbTrip = await getDbTripById(id);
    if (dbTrip) {
      return {
        id: dbTrip.id,
        travelerId: dbTrip.travelerId,
        fromCountry: dbTrip.fromCountry,
        toCountry: dbTrip.toCountry,
        fromFlag: dbTrip.fromFlag,
        toFlag: dbTrip.toFlag,
        departureDate: dbTrip.departureDate,
        returnDate: dbTrip.returnDate,
        capacityKg: dbTrip.capacityKg,
        status: dbTrip.status,
        travelerName: dbTrip.traveler?.fullName ?? "Traveler",
        travelerInitials: dbTrip.traveler?.avatarInitials ?? null,
        requests: dbTrip.requests.map((r) => ({
          id: r.id,
          itemName: r.itemName,
          itemUrl: r.itemUrl,
          maxBudget: r.maxBudget,
          courierFee: r.courierFee,
          status: r.status,
          buyerId: r.buyerId,
        })),
      };
    }
  } catch (error) {
    // DB unavailable / empty — fall back to mock for development
    console.error("DB lookup failed, falling back to mock:", error);
  }

  // Fallback: mock data (dev/demo seed)
  const mock = await getMockTripById(id);
  if (!mock) return null;
  return {
    id: mock.id,
    travelerId: mock.traveler.id,
    fromCountry: mock.fromCountry,
    toCountry: mock.toCountry,
    fromFlag: mock.fromFlag,
    toFlag: mock.toFlag,
    departureDate: mock.departureDate,
    returnDate: mock.returnDate,
    capacityKg: mock.capacityKg,
    status: mock.status,
    travelerName: mock.traveler.fullName,
    travelerInitials: mock.traveler.avatarInitials,
    travelerRating: mock.traveler.travelerRating,
    travelerTripsCompleted: mock.traveler.tripsCompleted,
    requests: mock.requests.map((r) => ({
      id: r.id,
      itemName: r.itemName,
      itemUrl: r.itemUrl,
      maxBudget: r.maxBudget,
      courierFee: r.courierFee,
      status: r.status,
      buyerId: r.buyer.id,
      buyerName: r.buyer.fullName,
      buyerInitials: r.buyer.avatarInitials,
      buyerRating: r.buyer.buyerRating,
    })),
  };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await loadTrip(id);
  if (!trip) notFound();

  const { userId } = await auth();
  const isOwner = !!userId && userId === trip.travelerId;
  const myRequest = userId
    ? trip.requests.find((r) => r.buyerId === userId)
    : null;

  const totalCommitted = trip.requests.reduce(
    (sum, r) => sum + Number(r.courierFee ?? 0),
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
              <span className="text-3xl">{trip.fromFlag ?? "🌍"}</span>
              <span className="text-gray-300 text-2xl">→</span>
              <span className="text-3xl">{trip.toFlag ?? "🌍"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {trip.fromCountry} → {trip.toCountry}
            </h1>
            <p className="text-gray-500 mt-1">
              {formatDate(trip.departureDate)}
              {trip.returnDate && ` · returning ${formatDate(trip.returnDate)}`}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {trip.status ?? "open"}
          </span>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Stat label="Capacity" value={`${trip.capacityKg}kg`} />
        <Stat label="Requests" value={String(trip.requests.length)} />
        <Stat label="Fees committed" value={`$${totalCommitted}`} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl">
          <Link
            href={trip.travelerId ? `/profile/${trip.travelerId}` : "#"}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
              {trip.travelerInitials ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {trip.travelerName}
              </p>
              {trip.travelerRating !== undefined && (
                <p className="text-xs text-gray-500">
                  ★ {trip.travelerRating.toFixed(1)}
                  {trip.travelerTripsCompleted !== undefined &&
                    ` · ${trip.travelerTripsCompleted} trips`}
                </p>
              )}
            </div>
          </Link>

          {/* Request CTA — visible to non-owners only, only if open */}
          {!isOwner && trip.status === "open" && (
            myRequest ? (
              <span className="text-xs text-gray-500 px-3 py-2 border border-gray-200 rounded-full shrink-0">
                You&apos;ve already requested an item on this trip
              </span>
            ) : (
              <Link
                href={`/post-request/${trip.id}`}
                className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 shrink-0"
              >
                Request item
              </Link>
            )
          )}
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
              {isOwner
                ? "Buyers will be able to attach item requests to your trip."
                : "Be the first to attach an item — your traveller is heading there soon."}
            </p>
            {!isOwner && trip.status === "open" && !myRequest && (
              <Link
                href={`/post-request/${trip.id}`}
                className="inline-block px-5 py-2.5 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
              >
                Attach a request
              </Link>
            )}
          </div>
        ) : (
          <ul className="border border-gray-100 rounded-2xl px-4">
            {trip.requests.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                    {r.buyerInitials ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.itemName}
                    </p>
                    {r.buyerName && (
                      <p className="text-xs text-gray-500 truncate">
                        {r.buyerName}
                        {r.buyerRating !== undefined &&
                          ` · ★ ${r.buyerRating.toFixed(1)}`}
                      </p>
                    )}
                    {r.itemUrl && (
                      <a
                        href={r.itemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-500 underline hover:text-gray-900"
                      >
                        Item link
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    ${r.maxBudget}
                  </p>
                  <p className="text-xs text-gray-500">
                    + ${r.courierFee ?? "0"} fee
                  </p>
                  <div className="mt-1.5">
                    {isOwner ? (
                      <RequestActions
                        requestId={r.id}
                        initialStatus={r.status ?? "pending"}
                      />
                    ) : (
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
                          STATUS_BADGE[r.status ?? "pending"] ??
                          STATUS_BADGE.pending
                        }`}
                      >
                        {(r.status ?? "pending").charAt(0).toUpperCase() +
                          (r.status ?? "pending").slice(1)}
                      </span>
                    )}
                  </div>
                </div>
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
