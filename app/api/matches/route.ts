// TODO: replace with Supabase query
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

  const match = {
    id: `m_${Date.now()}`,
    requestId: body.requestId,
    tripId: body.tripId,
    status: "agreed" as const,
    agreedPrice: body.agreedPrice,
    courierFee: body.courierFee,
  };

  return Response.json({ match }, { status: 201 });
}
