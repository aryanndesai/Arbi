import { desc, eq, inArray } from "drizzle-orm";

import type {
  ItemRequest,
  Match,
  MatchStatus,
  RequestStatus,
  Trip,
  TripStatus,
  User,
} from "@/types";

import { getDb } from "./index";
import { itemRequests, matches, trips, users } from "./schema";

// ─── Row types ────────────────────────────────────────────────────────────────

type UserRow = typeof users.$inferSelect;
type TripRow = typeof trips.$inferSelect;
type RequestRow = typeof itemRequests.$inferSelect;

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    avatarInitials: row.avatarInitials,
    travelerRating: row.travelerRating ?? 5.0,
    buyerRating: row.buyerRating ?? 5.0,
    tripsCompleted: row.tripsCompleted ?? 0,
    requestsCompleted: row.requestsCompleted ?? 0,
  };
}

function mapRequest(row: RequestRow, buyer: User): ItemRequest {
  return {
    id: row.id,
    tripId: row.tripId,
    buyer,
    itemName: row.itemName,
    itemUrl: row.itemUrl,
    itemImageUrl: row.itemImageUrl,
    maxBudget: row.maxBudget,
    courierFee: row.courierFee,
    status: row.status as RequestStatus,
  };
}

function mapTrip(row: TripRow, traveler: User, requests: ItemRequest[]): Trip {
  return {
    id: row.id,
    traveler,
    fromCountry: row.fromCountry,
    toCountry: row.toCountry,
    fromFlag: row.fromFlag,
    toFlag: row.toFlag,
    departureDate: row.departureDate,
    returnDate: row.returnDate,
    capacityKg: row.capacityKg,
    status: row.status as TripStatus,
    requests,
  };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function fetchRequestsForTrips(tripIds: string[]): Promise<ItemRequest[]> {
  if (tripIds.length === 0) return [];
  const rows = await getDb()
    .select()
    .from(itemRequests)
    .where(inArray(itemRequests.tripId, tripIds));
  if (rows.length === 0) return [];
  const buyerIds = [...new Set(rows.map((r) => r.buyerId))];
  const buyerRows = await getDb()
    .select()
    .from(users)
    .where(inArray(users.id, buyerIds));
  const buyerMap = new Map(buyerRows.map((u) => [u.id, mapUser(u)]));
  return rows.map((r) => mapRequest(r, buyerMap.get(r.buyerId)!));
}

// ─── Read queries ─────────────────────────────────────────────────────────────

export async function getTrips(): Promise<Trip[]> {
  const tripRows = await getDb()
    .select()
    .from(trips)
    .orderBy(desc(trips.createdAt));
  if (tripRows.length === 0) return [];

  const travelerIds = [...new Set(tripRows.map((t) => t.travelerId))];
  const travelerRows = await getDb()
    .select()
    .from(users)
    .where(inArray(users.id, travelerIds));
  const travelerMap = new Map(travelerRows.map((u) => [u.id, mapUser(u)]));

  const tripIds = tripRows.map((t) => t.id);
  const allRequests = await fetchRequestsForTrips(tripIds);
  const requestsByTrip = new Map<string, ItemRequest[]>();
  for (const req of allRequests) {
    const arr = requestsByTrip.get(req.tripId) ?? [];
    arr.push(req);
    requestsByTrip.set(req.tripId, arr);
  }

  return tripRows.map((t) =>
    mapTrip(t, travelerMap.get(t.travelerId)!, requestsByTrip.get(t.id) ?? [])
  );
}

export async function getTripById(id: string): Promise<Trip | null> {
  const [row] = await getDb().select().from(trips).where(eq(trips.id, id));
  if (!row) return null;

  const [travelerRow] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, row.travelerId));
  if (!travelerRow) return null;

  const tripRequests = await fetchRequestsForTrips([id]);
  return mapTrip(row, mapUser(travelerRow), tripRequests);
}

export async function getTripsForUser(userId: string): Promise<Trip[]> {
  const tripRows = await getDb()
    .select()
    .from(trips)
    .where(eq(trips.travelerId, userId))
    .orderBy(desc(trips.createdAt));
  if (tripRows.length === 0) return [];

  const [travelerRow] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, userId));
  if (!travelerRow) return [];
  const traveler = mapUser(travelerRow);

  const tripIds = tripRows.map((t) => t.id);
  const allRequests = await fetchRequestsForTrips(tripIds);
  const requestsByTrip = new Map<string, ItemRequest[]>();
  for (const req of allRequests) {
    const arr = requestsByTrip.get(req.tripId) ?? [];
    arr.push(req);
    requestsByTrip.set(req.tripId, arr);
  }

  return tripRows.map((t) =>
    mapTrip(t, traveler, requestsByTrip.get(t.id) ?? [])
  );
}

export async function getRequestsForTrip(tripId: string): Promise<ItemRequest[]> {
  return fetchRequestsForTrips([tripId]);
}

export async function getRequestsForUser(userId: string): Promise<ItemRequest[]> {
  const rows = await getDb()
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.buyerId, userId))
    .orderBy(desc(itemRequests.createdAt));
  if (rows.length === 0) return [];

  const [buyerRow] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, userId));
  if (!buyerRow) return [];
  const buyer = mapUser(buyerRow);

  return rows.map((r) => mapRequest(r, buyer));
}

export async function getUserById(id: string): Promise<User | null> {
  const [row] = await getDb().select().from(users).where(eq(users.id, id));
  return row ? mapUser(row) : null;
}

// ─── Write queries ────────────────────────────────────────────────────────────

// travelerId, fromFlag, toFlag come from auth session in production;
// default to placeholder until auth is wired up.
const PLACEHOLDER_TRAVELER_ID = "u_1";

export async function createTrip(data: {
  fromCountry: string;
  toCountry: string;
  departureDate: string;
  returnDate: string;
  capacityKg: number;
  fromFlag?: string;
  toFlag?: string;
  travelerId?: string;
}): Promise<Trip> {
  const id = `t_${Date.now()}`;
  await getDb().insert(trips).values({
    id,
    travelerId: data.travelerId ?? PLACEHOLDER_TRAVELER_ID,
    fromCountry: data.fromCountry,
    toCountry: data.toCountry,
    fromFlag: data.fromFlag ?? "🌍",
    toFlag: data.toFlag ?? "🌍",
    departureDate: data.departureDate,
    returnDate: data.returnDate,
    capacityKg: data.capacityKg,
    status: "open",
  });
  return (await getTripById(id))!;
}

// buyerId comes from auth session in production.
const PLACEHOLDER_BUYER_ID = "u_2";

export async function createRequest(data: {
  tripId: string;
  itemName: string;
  itemUrl: string;
  itemImageUrl?: string;
  maxBudget: number;
  courierFee: number;
  buyerId?: string;
}): Promise<ItemRequest> {
  const id = `r_${Date.now()}`;
  const [row] = await getDb()
    .insert(itemRequests)
    .values({
      id,
      tripId: data.tripId,
      buyerId: data.buyerId ?? PLACEHOLDER_BUYER_ID,
      itemName: data.itemName,
      itemUrl: data.itemUrl,
      itemImageUrl: data.itemImageUrl ?? "",
      maxBudget: data.maxBudget,
      courierFee: data.courierFee,
      status: "open",
    })
    .returning();
  const [buyerRow] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, row.buyerId));
  return mapRequest(row, mapUser(buyerRow));
}

export async function createMatch(data: {
  requestId: string;
  tripId: string;
  agreedPrice: number;
  courierFee: number;
  status?: MatchStatus;
}): Promise<Match> {
  const id = `m_${Date.now()}`;
  const [row] = await getDb()
    .insert(matches)
    .values({
      id,
      requestId: data.requestId,
      tripId: data.tripId,
      agreedPrice: data.agreedPrice,
      courierFee: data.courierFee,
      status: data.status ?? "agreed",
    })
    .returning();
  return {
    id: row.id,
    requestId: row.requestId,
    tripId: row.tripId,
    status: row.status as MatchStatus,
    agreedPrice: row.agreedPrice,
    courierFee: row.courierFee,
  };
}

// Constant — no DB query needed
export function getCurrentUserId(): string {
  return "u_1";
}
