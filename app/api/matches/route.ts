import { auth } from "@clerk/nextjs/server";
import {
  createMatch,
  getMatchByRequestId,
  getRequestById,
  getTripById,
} from "@/db/queries";
import { validateMatchPayload } from "@/lib/validation";

// Matches are normally created automatically when a traveller accepts a
// request (PATCH /api/requests/[id]/status). This endpoint lets the trip owner
// record one explicitly, e.g. with a negotiated price.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateMatchPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }
  const { requestId, agreedPrice, courierFee } = validated.data;

  try {
    const itemRequest = await getRequestById(requestId);
    if (!itemRequest || !itemRequest.tripId) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const trip = await getTripById(itemRequest.tripId);
    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.travelerId !== userId) {
      return Response.json(
        { error: "Only the trip owner can create a match" },
        { status: 403 }
      );
    }
    if (itemRequest.status !== "accepted") {
      return Response.json(
        { error: "Accept the request before creating a match" },
        { status: 409 }
      );
    }
    if (await getMatchByRequestId(requestId)) {
      return Response.json(
        { error: "A match already exists for this request" },
        { status: 409 }
      );
    }

    const match = await createMatch({
      requestId,
      tripId: itemRequest.tripId,
      status: "active",
      agreedPrice: agreedPrice.toString(),
      courierFee: courierFee.toString(),
    });

    return Response.json({ match }, { status: 201 });
  } catch (error) {
    console.error("Error creating match:", error);
    return Response.json({ error: "Failed to create match" }, { status: 500 });
  }
}
