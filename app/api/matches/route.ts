// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createMatch } from "@/db/queries";
import { getRequestUserId } from "@/lib/auth";
import { validateMatchPayload } from "@/lib/validation";

export async function POST(request: Request) {
  const userId = getRequestUserId(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateMatchPayload(body);
  if (!validated.ok) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const match = await createMatch(validated.data);

  return Response.json({ match }, { status: 201 });
}
