import { auth } from "@clerk/nextjs/server";
import {
  getRequestById,
  getTripById,
  updateRequestStatus,
} from "@/db/queries";
import type { RequestStatus } from "@/types";

const ALLOWED: RequestStatus[] = ["accepted", "declined"];

function isAllowed(value: unknown): value is "accepted" | "declined" {
  return typeof value === "string" && (ALLOWED as string[]).includes(value);
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

    if (!body || !isAllowed(body.status)) {
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

    const updated = await updateRequestStatus(id, body.status);
    return Response.json({ request: updated });
  } catch (error) {
    console.error("Error updating request status:", error);
    return Response.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
