// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createRequest, getCurrentUserId, getRequestsForUser } from "@/db/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? getCurrentUserId();
  const requests = await getRequestsForUser(userId);
  return Response.json({ requests });
}

export async function POST(request: Request) {
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

  const created = await createRequest({
    tripId: body.tripId,
    itemName: body.itemName,
    itemUrl: body.itemUrl,
    itemImageUrl: body.itemImageUrl,
    maxBudget: body.maxBudget,
    courierFee: body.courierFee,
  });

  return Response.json({ request: created }, { status: 201 });
}
