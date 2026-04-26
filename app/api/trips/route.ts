import { getTrips, createTrip } from "@/db/queries";

export async function GET() {
  try {
    const trips = await getTrips();
    return Response.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return Response.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.fromCountry !== "string" ||
      typeof body.toCountry !== "string" ||
      typeof body.departureDate !== "string" ||
      typeof body.returnDate !== "string" ||
      typeof body.capacityKg !== "number" ||
      !body.travelerId
    ) {
      return Response.json({ error: "Invalid trip payload" }, { status: 400 });
    }

    const trip = await createTrip({
      travelerId: body.travelerId,
      fromCountry: body.fromCountry,
      toCountry: body.toCountry,
      departureDate: body.departureDate,
      returnDate: body.returnDate || null,
      capacityKg: body.capacityKg.toString(),
      status: "open",
    });

    return Response.json({ trip }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return Response.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
