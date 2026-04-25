import { getTrips } from "@/lib/mock-data";

// TODO: replace with Supabase query
export async function GET() {
  const trips = await getTrips();
  return Response.json({ trips });
}

// TODO: replace with Supabase query
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

  const created = {
    id: `t_${Date.now()}`,
    fromCountry: body.fromCountry,
    toCountry: body.toCountry,
    departureDate: body.departureDate,
    returnDate: body.returnDate,
    capacityKg: body.capacityKg,
    status: "open" as const,
  };

  return Response.json({ trip: created }, { status: 201 });
}
