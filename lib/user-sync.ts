import { currentUser } from "@clerk/nextjs/server";
import { createUser, getUserById } from "@/db/queries";

type ProfileInput = {
  email: string;
  firstName: string | null;
  lastName: string | null;
};

function getInitials(first: string | null, last: string | null, email: string): string {
  const f = (first ?? "").trim().charAt(0).toUpperCase();
  const l = (last ?? "").trim().charAt(0).toUpperCase();
  return `${f}${l}` || email.charAt(0).toUpperCase() || "?";
}

// Maps a Clerk profile to the columns stored in `users`. Shared by the Clerk
// webhook and ensureUserRecord so both write the same shape.
export function buildUserProfile({ email, firstName, lastName }: ProfileInput) {
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ").trim() || email.split("@")[0];
  return {
    email,
    fullName,
    avatarInitials: getInitials(firstName, lastName, email),
  };
}

// Trips and requests reference users.id, so the signed-in user must have a row
// before they can post anything. The Clerk webhook normally creates it, but
// it can be missing (webhook not configured locally, delivery delayed or
// failed). This fills the gap from the Clerk session on demand.
export async function ensureUserRecord(userId: string): Promise<boolean> {
  const existing = await getUserById(userId);
  if (existing) return true;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) return false;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return false;

  await createUser({
    id: userId,
    ...buildUserProfile({
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    }),
  });
  return true;
}
