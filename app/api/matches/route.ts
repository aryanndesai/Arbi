// REAL DB: using Drizzle ORM + Supabase
// To switch back to mock data, import from @/lib/mock-data
import { createMatch } from "@/db/queries";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.requestId !== "string" ||
    typeof body.tripId !== "string" ||
    typeof body.agreedPrice !== "number" ||
    typeof body.courierFee !== "number"
  ) {
    return Response.json({ error: "Invalid match payload" }, { status: 400 });
  }

  const match = await createMatch({
    requestId: body.requestId,
    tripId: body.tripId,
    agreedPrice: body.agreedPrice,
    courierFee: body.courierFee,
  });

  return Response.json({ match }, { status: 201 });
}
