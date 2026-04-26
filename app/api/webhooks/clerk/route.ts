import { Webhook } from "svix";
import { headers } from "next/headers";
import { createUser } from "@/db/queries";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUserCreatedEvent = {
  type: "user.created";
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string | null;
    first_name: string | null;
    last_name: string | null;
  };
};

type ClerkWebhookEvent =
  | ClerkUserCreatedEvent
  | { type: string; data: Record<string, unknown> };

function getInitials(first: string | null, last: string | null): string {
  const f = (first ?? "").trim().charAt(0).toUpperCase();
  const l = (last ?? "").trim().charAt(0).toUpperCase();
  return `${f}${l}` || "?";
}

function getPrimaryEmail(
  addresses: ClerkEmailAddress[],
  primaryId: string | null
): string | null {
  if (!addresses.length) return null;
  const primary = primaryId
    ? addresses.find((a) => a.id === primaryId)
    : null;
  return (primary ?? addresses[0]).email_address;
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const headerList = await headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    // ignore other event types — return 200 so Clerk doesn't retry
    return Response.json({ ok: true, ignored: event.type });
  }

  try {
    const data = (event as ClerkUserCreatedEvent).data;
    const email = getPrimaryEmail(
      data.email_addresses,
      data.primary_email_address_id
    );
    if (!email) {
      return Response.json({ error: "No email on user" }, { status: 400 });
    }

    const fullName =
      [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
      email.split("@")[0];

    await createUser({
      id: data.id,
      email,
      fullName,
      avatarInitials: getInitials(data.first_name, data.last_name),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error syncing user to Supabase:", error);
    return Response.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
