// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createTrip, getTrips } from "@/db/queries";

export async function GET() {
  const trips = await getTrips();
  return Response.json({ trips });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.fromCountry !== "string" ||
    typeof body.toCountry !== "string" ||
    typeof body.departureDate !== "string" ||
    typeof body.returnDate !== "string" ||
    typeof body.capacityKg !== "number"
  ) {
    return Response.json({ error: "Invalid trip payload" }, { status: 400 });
  }

  const trip = await createTrip({
    fromCountry: body.fromCountry,
    toCountry: body.toCountry,
    fromFlag: body.fromFlag,
    toFlag: body.toFlag,
    departureDate: body.departureDate,
    returnDate: body.returnDate,
    capacityKg: body.capacityKg,
  });

  return Response.json({ trip }, { status: 201 });
}
