import { getTripById } from "@/lib/mock-data";

// TODO: replace with Supabase query
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
