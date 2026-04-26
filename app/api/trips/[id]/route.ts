// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { getTripById } from "@/db/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const trip = await getTripById(id);
  if (!trip) {
    return Response.json({ error: "Trip not found" }, { status: 404 });
  }
  return Response.json({ trip });
}
