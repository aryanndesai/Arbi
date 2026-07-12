// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createTrip, getTrips } from "@/db/queries";
import { getRequestUserId } from "@/lib/auth";
import { validateTripPayload } from "@/lib/validation";

export async function GET() {
  const trips = await getTrips();
  return Response.json({ trips });
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateTripPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const trip = await createTrip({
    ...validated.data,
    travelerId: userId,
  });

  return Response.json({ trip }, { status: 201 });
}
