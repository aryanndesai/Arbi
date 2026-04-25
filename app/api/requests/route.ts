import { getCurrentUserId, getRequestsForUser } from "@/lib/mock-data";

// TODO: replace with Supabase query
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? getCurrentUserId();
  const requests = await getRequestsForUser(userId);
  return Response.json({ requests });
}

// TODO: replace with Supabase query
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

  const created = {
    id: `r_${Date.now()}`,
    tripId: body.tripId,
    itemName: body.itemName,
    itemUrl: body.itemUrl,
    itemImageUrl: "",
    maxBudget: body.maxBudget,
    courierFee: body.courierFee,
    status: "open" as const,
  };

  return Response.json({ request: created }, { status: 201 });
}
