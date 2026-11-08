import { auth } from "@clerk/nextjs/server";
import { getTripSummaries, createTrip } from "@/db/queries";
import { getCountryFlag } from "@/lib/country-style";
import { ensureUserRecord } from "@/lib/user-sync";
import { validateTripPayload } from "@/lib/validation";

// GET is public — anyone can browse trips
export async function GET() {
  try {
    const trips = await getTripSummaries();
    return Response.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return Response.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateTripPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  try {
    if (!(await ensureUserRecord(userId))) {
      return Response.json(
        { error: "Your account isn't set up yet — please try again shortly" },
        { status: 409 }
      );
    }

    const { fromCountry, toCountry, departureDate, returnDate, capacityKg } =
      validated.data;
    const trip = await createTrip({
      travelerId: userId,
      fromCountry,
      toCountry,
      // Flags are derived server-side so every trip gets one, whatever the client sends
      fromFlag: getCountryFlag(fromCountry),
      toFlag: getCountryFlag(toCountry),
      departureDate,
      returnDate,
      capacityKg: capacityKg.toString(),
      status: "open",
    });

    return Response.json({ trip }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return Response.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
