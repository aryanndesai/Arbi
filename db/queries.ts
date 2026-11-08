import { eq, inArray } from 'drizzle-orm';
import { db } from './index';
import {
  users,
  trips,
  itemRequests,
  NewTrip,
  NewItemRequest,
  NewUser,
} from './schema';
import type { TripSummary } from '@/types';

function toNumber(value: string | number | null | undefined): number {
  return value === null || value === undefined ? 0 : Number(value);
}

// Trips queries
export async function getTrips() {
  return await db
    .select({
      id: trips.id,
      travelerId: trips.travelerId,
      fromCountry: trips.fromCountry,
      toCountry: trips.toCountry,
      fromFlag: trips.fromFlag,
      toFlag: trips.toFlag,
      departureDate: trips.departureDate,
      returnDate: trips.returnDate,
      capacityKg: trips.capacityKg,
      status: trips.status,
      createdAt: trips.createdAt,
      traveler: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarInitials: users.avatarInitials,
      },
    })
    .from(trips)
    .leftJoin(users, eq(trips.travelerId, users.id));
}

// Trip list shaped for TripCard (home, browse, profile) — real DB data with a
// request count per trip instead of the full nested request rows.
export async function getTripSummaries(): Promise<TripSummary[]> {
  const rows = await db
    .select({
      id: trips.id,
      fromCountry: trips.fromCountry,
      toCountry: trips.toCountry,
      fromFlag: trips.fromFlag,
      toFlag: trips.toFlag,
      departureDate: trips.departureDate,
      capacityKg: trips.capacityKg,
      status: trips.status,
      travelerId: users.id,
      travelerName: users.fullName,
      travelerInitials: users.avatarInitials,
      travelerRating: users.travelerRating,
      travelerTripsCompleted: users.tripsCompleted,
    })
    .from(trips)
    .leftJoin(users, eq(trips.travelerId, users.id));

  const requestCounts = await getRequestCountsByTrip(rows.map((r) => r.id));

  return rows.map((r) => ({
    id: r.id,
    traveler: {
      id: r.travelerId ?? '',
      fullName: r.travelerName ?? 'Traveler',
      avatarInitials: r.travelerInitials ?? '?',
      travelerRating: toNumber(r.travelerRating),
      tripsCompleted: r.travelerTripsCompleted ?? 0,
    },
    fromCountry: r.fromCountry,
    toCountry: r.toCountry,
    fromFlag: r.fromFlag ?? '🌍',
    toFlag: r.toFlag ?? '🌍',
    departureDate: r.departureDate,
    capacityKg: toNumber(r.capacityKg),
    status: (r.status ?? 'open') as TripSummary['status'],
    requestCount: requestCounts.get(r.id) ?? 0,
  }));
}

export async function getTripsForUserSummary(userId: string): Promise<TripSummary[]> {
  const [traveler, rows] = await Promise.all([
    getUserById(userId),
    getTripsForUser(userId),
  ]);
  const requestCounts = await getRequestCountsByTrip(rows.map((r) => r.id));

  return rows.map((r) => ({
    id: r.id,
    traveler: {
      id: userId,
      fullName: traveler?.fullName ?? 'Traveler',
      avatarInitials: traveler?.avatarInitials ?? '?',
      travelerRating: toNumber(traveler?.travelerRating),
      tripsCompleted: traveler?.tripsCompleted ?? 0,
    },
    fromCountry: r.fromCountry,
    toCountry: r.toCountry,
    fromFlag: r.fromFlag ?? '🌍',
    toFlag: r.toFlag ?? '🌍',
    departureDate: r.departureDate,
    capacityKg: toNumber(r.capacityKg),
    status: (r.status ?? 'open') as TripSummary['status'],
    requestCount: requestCounts.get(r.id) ?? 0,
  }));
}

async function getRequestCountsByTrip(tripIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (tripIds.length === 0) return counts;

  const rows = await db
    .select({ tripId: itemRequests.tripId })
    .from(itemRequests)
    .where(inArray(itemRequests.tripId, tripIds));

  for (const row of rows) {
    if (!row.tripId) continue;
    counts.set(row.tripId, (counts.get(row.tripId) ?? 0) + 1);
  }
  return counts;
}

export async function getDestinationCountries(): Promise<string[]> {
  const rows = await db.selectDistinct({ toCountry: trips.toCountry }).from(trips);
  return rows.map((r) => r.toCountry).sort();
}

export async function getTripById(id: string) {
  const tripData = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .limit(1);

  if (!tripData[0]) {
    return null;
  }

  const trip = tripData[0];

  // Join buyer info so the trip owner sees who's behind each request
  const requests = await db
    .select({
      id: itemRequests.id,
      tripId: itemRequests.tripId,
      itemName: itemRequests.itemName,
      itemUrl: itemRequests.itemUrl,
      itemImageUrl: itemRequests.itemImageUrl,
      maxBudget: itemRequests.maxBudget,
      courierFee: itemRequests.courierFee,
      status: itemRequests.status,
      buyerId: itemRequests.buyerId,
      buyerName: users.fullName,
      buyerInitials: users.avatarInitials,
      buyerRating: users.buyerRating,
    })
    .from(itemRequests)
    .leftJoin(users, eq(itemRequests.buyerId, users.id))
    .where(eq(itemRequests.tripId, id));

  const traveler = trip.travelerId ? await getUserById(trip.travelerId) : null;

  return {
    ...trip,
    traveler,
    requests,
  };
}

export async function createTrip(data: NewTrip) {
  const result = await db.insert(trips).values(data).returning();
  return result[0];
}

export async function getTripsForUser(userId: string) {
  return await db
    .select()
    .from(trips)
    .where(eq(trips.travelerId, userId));
}

// Item requests queries
export async function getRequestsForTrip(tripId: string) {
  return await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.tripId, tripId));
}

export async function createRequest(data: NewItemRequest) {
  const result = await db
    .insert(itemRequests)
    .values(data)
    .returning();
  return result[0];
}

export async function getRequestsForUser(userId: string) {
  return await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.buyerId, userId));
}

export async function getRequestById(id: string) {
  const result = await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updateRequestStatus(
  id: string,
  status: 'pending' | 'accepted' | 'declined' | 'completed'
) {
  const result = await db
    .update(itemRequests)
    .set({ status })
    .where(eq(itemRequests.id, id))
    .returning();
  return result[0] || null;
}

// User queries
export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createUser(data: NewUser) {
  const result = await db
    .insert(users)
    .values(data)
    .returning();
  return result[0];
}
