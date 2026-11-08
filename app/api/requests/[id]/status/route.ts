import { auth } from "@clerk/nextjs/server";
import {
  createMatch,
  getRequestById,
  getTripById,
  resolvePendingRequest,
} from "@/db/queries";

type Decision = "accepted" | "declined";

function isDecision(value: unknown): value is Decision {
  return value === "accepted" || value === "declined";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null);

    if (!body || !isDecision(body.status)) {
      return Response.json(
        { error: "Invalid status — must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    const itemRequest = await getRequestById(id);
    if (!itemRequest || !itemRequest.tripId) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    // Only the trip owner may accept/decline requests on that trip
    const trip = await getTripById(itemRequest.tripId);
    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.travelerId !== userId) {
      return Response.json(
        { error: "Only the trip owner can change request status" },
        { status: 403 }
      );
    }

    const updated = await resolvePendingRequest(id, body.status);
    if (!updated) {
      return Response.json(
        { error: `This request has already been ${itemRequest.status}` },
        { status: 409 }
      );
    }

    // Accepting a request is what pairs a buyer with a traveller, so record
    // the match now (at the buyer's stated budget and fee).
    let match = null;
    if (updated.status === "accepted") {
      match = await createMatch({
        requestId: updated.id,
        tripId: itemRequest.tripId,
        status: "active",
        agreedPrice: updated.maxBudget,
        courierFee: updated.courierFee,
      });
    }

    return Response.json({ request: updated, match });
  } catch (error) {
    console.error("Error updating request status:", error);
    return Response.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
