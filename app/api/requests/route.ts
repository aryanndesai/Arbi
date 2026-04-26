import { getRequestsForUser, createRequest } from "@/db/queries";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }
    const requests = await getRequestsForUser(userId);
    return Response.json({ requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return Response.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.tripId !== "string" ||
      typeof body.buyerId !== "string" ||
      typeof body.itemName !== "string" ||
      typeof body.itemUrl !== "string" ||
      typeof body.maxBudget !== "number" ||
      typeof body.courierFee !== "number"
    ) {
      return Response.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const itemRequest = await createRequest({
      tripId: body.tripId,
      buyerId: body.buyerId,
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
