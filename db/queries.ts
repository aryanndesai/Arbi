import { eq } from 'drizzle-orm';
import { db } from './index';
import {
  users,
  trips,
  itemRequests,
  NewTrip,
  NewItemRequest,
  NewUser,
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
    .where(eq(trips.id, id))
    .limit(1);

  if (!tripData[0]) {
    return null;
  }

  const trip = tripData[0];

  const requests = await db
    .select()
    .from(itemRequests)
    .where(eq(itemRequests.tripId, id));

  const traveler = trip.travelerId
    ? await db
        .select()
        .from(users)
        .where(eq(users.id, trip.travelerId))
        .limit(1)
    : [];

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
