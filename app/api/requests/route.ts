import { auth } from "@clerk/nextjs/server";
import {
  createRequest,
  getRequestByTripAndBuyer,
  getRequestsForUser,
  getTripById,
} from "@/db/queries";
import { ensureUserRecord } from "@/lib/user-sync";
import { validateRequestPayload } from "@/lib/validation";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await getRequestsForUser(userId);
    return Response.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return Response.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateRequestPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }
  const data = validated.data;

  try {
    const trip = await getTripById(data.tripId);
    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.travelerId === userId) {
      return Response.json(
        { error: "You can't request an item on your own trip" },
        { status: 403 }
      );
    }
    if ((trip.status ?? "open") !== "open") {
      return Response.json(
        { error: "This trip is no longer accepting requests" },
        { status: 409 }
      );
    }
    if (await getRequestByTripAndBuyer(data.tripId, userId)) {
      return Response.json(
        { error: "You've already requested an item on this trip" },
        { status: 409 }
      );
    }

    if (!(await ensureUserRecord(userId))) {
      return Response.json(
        { error: "Your account isn't set up yet — please try again shortly" },
        { status: 409 }
      );
    }

    const itemRequest = await createRequest({
      tripId: data.tripId,
      buyerId: userId,
      itemName: data.itemName,
      itemUrl: data.itemUrl,
      itemImageUrl: data.itemImageUrl,
      maxBudget: data.maxBudget.toString(),
      courierFee: data.courierFee.toString(),
      status: "pending",
    });

    return Response.json({ request: itemRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
}
