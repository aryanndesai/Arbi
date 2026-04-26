import { getTripById } from "@/db/queries";

// Public — anyone can view a trip
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const trip = await getTripById(id);
    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    return Response.json({ trip });
  } catch (error) {
    console.error("Error fetching trip:", error);
    return Response.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}
