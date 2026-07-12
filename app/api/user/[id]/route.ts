// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import {
  getRequestsForUser,
  getTripsForUser,
  getUserById,
} from "@/db/queries";
import { getRequestUserId } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authUserId = getRequestUserId(request);
  if (!authUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (id !== authUserId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

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
}
