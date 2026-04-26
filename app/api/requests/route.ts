import { auth } from "@clerk/nextjs/server";
import { getRequestsForUser, createRequest } from "@/db/queries";

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

  try {
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.tripId !== "string" ||
      typeof body.itemName !== "string" ||
      typeof body.itemUrl !== "string" ||
      typeof body.maxBudget !== "number" ||
      typeof body.courierFee !== "number"
    ) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const itemRequest = await createRequest({
      tripId: body.tripId,
      buyerId: userId,
      itemName: body.itemName,
      itemUrl: body.itemUrl,
      itemImageUrl: body.itemImageUrl || null,
      maxBudget: body.maxBudget.toString(),
      courierFee: body.courierFee.toString(),
      status: "pending",
    });

    return Response.json({ request: itemRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return Response.json({ error: "Failed to create request" }, { status: 500 });
  }
}
