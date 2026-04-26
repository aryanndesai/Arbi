import {
  getRequestsForUser,
  getTripsForUser,
  getUserById,
} from "@/db/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getUserById(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const [trips, requests] = await Promise.all([
      getTripsForUser(id),
      getRequestsForUser(id),
    ]);

    return Response.json({
      user,
      stats: {
        tripsPosted: trips.length,
        requestsMade: requests.length,
        tripsCompleted: user.tripsCompleted,
        requestsCompleted: user.requestsCompleted,
        travelerRating: user.travelerRating,
        buyerRating: user.buyerRating,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
