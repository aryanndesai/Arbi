import { auth } from "@clerk/nextjs/server";
import { getTripById } from "@/db/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
