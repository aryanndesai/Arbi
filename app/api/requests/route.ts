// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createRequest, getCurrentUserId, getRequestsForUser } from "@/db/queries";
import { getRequestUserId } from "@/lib/auth";
import { validateRequestPayload } from "@/lib/validation";

export async function GET(request: Request) {
  const authUserId = getRequestUserId(request);
  if (!authUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedUserId = url.searchParams.get("userId");
  const userId = requestedUserId ?? getCurrentUserId();
  if (userId !== authUserId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const requests = await getRequestsForUser(userId);
  return Response.json({ requests });
}

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateRequestPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const created = await createRequest({
    ...validated.data,
    buyerId: userId,
  });

  return Response.json({ request: created }, { status: 201 });
}
