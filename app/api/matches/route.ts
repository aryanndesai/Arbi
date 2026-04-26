import { auth } from "@clerk/nextjs/server";

// TODO: replace with Supabase query
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
  } catch (error) {
    console.error("Error creating match:", error);
    return Response.json({ error: "Failed to create match" }, { status: 500 });
  }
}
