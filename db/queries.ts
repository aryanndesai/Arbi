import { eq } from 'drizzle-orm';
import { db } from './index';
import {
  users,
  trips,
  itemRequests,
  NewTrip,
  NewItemRequest,
} from './schema';

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

export async function getTripById(id: string) {
  const tripData = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id as string))
    .limit(1);

  if (!tripData[0]) {
    return null;
  }

  const trip = tripData[0];

  const requests = await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.tripId, id as string));

  const traveler = await db
    .select()
    .from(users)
    .where(eq(users.id, trip.travelerId as string))
    .limit(1);

  return {
    ...trip,
    traveler: traveler[0] || null,
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
    .where(eq(trips.travelerId, userId as string));
}

// Item requests queries
export async function getRequestsForTrip(tripId: string) {
  return await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.tripId, tripId as string));
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
    .where(eq(itemRequests.buyerId, userId as string));
}

// User queries
export async function getUserById(id: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id as string))
    .limit(1);

  return result[0] || null;
}
