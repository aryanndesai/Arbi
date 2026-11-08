import { Webhook } from "svix";
import { headers } from "next/headers";
import { createUser, updateUser, deleteUser } from "@/db/queries";

type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

type ClerkUserData = {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
};

type ClerkUserEvent = {
  type: "user.created" | "user.updated";
  data: ClerkUserData;
};

type ClerkDeletedEvent = {
  type: "user.deleted";
  data: { id?: string; deleted?: boolean };
};

type ClerkWebhookEvent =
  | ClerkUserEvent
  | ClerkDeletedEvent
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

// Maps a Clerk user payload to the columns we store. Returns null if the user
// has no email address we can key on.
function toUserRow(data: ClerkUserData) {
  const email = getPrimaryEmail(
    data.email_addresses,
    data.primary_email_address_id
  );
  if (!email) return null;

  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    email.split("@")[0];

  return {
    email,
    fullName,
    avatarInitials: getInitials(data.first_name, data.last_name),
  };
}

// Postgres raises 23503 when a delete would orphan a foreign-key reference
// (a user who still has trips or requests). We treat that as "keep the row".
function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23503"
  );
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

  try {
    switch (event.type) {
      case "user.created": {
        const data = (event as ClerkUserEvent).data;
        const row = toUserRow(data);
        if (!row) {
          return Response.json({ error: "No email on user" }, { status: 400 });
        }
        await createUser({ id: data.id, ...row });
        return Response.json({ ok: true });
      }

      case "user.updated": {
        const data = (event as ClerkUserEvent).data;
        const row = toUserRow(data);
        if (!row) {
          return Response.json({ error: "No email on user" }, { status: 400 });
        }
        // If the row doesn't exist yet (e.g. we missed the created event),
        // create it so the two stores stay in sync.
        const updated = await updateUser(data.id, row);
        if (!updated) {
          await createUser({ id: data.id, ...row });
        }
        return Response.json({ ok: true });
      }

      case "user.deleted": {
        const id = (event as ClerkDeletedEvent).data.id;
        if (!id) {
          return Response.json({ error: "No user id" }, { status: 400 });
        }
        try {
          await deleteUser(id);
        } catch (error) {
          // The user still owns trips or requests — keep the row so history
          // stays intact, and don't ask Clerk to retry.
          if (isForeignKeyViolation(error)) {
            console.warn(`Kept user ${id}: still referenced by trips/requests`);
            return Response.json({ ok: true, kept: true });
          }
          throw error;
        }
        return Response.json({ ok: true });
      }

      default:
        // Ignore other event types — return 200 so Clerk doesn't retry.
        return Response.json({ ok: true, ignored: event.type });
    }
  } catch (error) {
    console.error("Error syncing user to Supabase:", error);
    return Response.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
