import type { ItemRequest, Match, Trip, User } from "@/types";

const users: User[] = [
  {
    id: "u_1",
    email: "alyssa.see@example.com",
    fullName: "Alyssa See",
    avatarInitials: "AS",
    travelerRating: 4.9,
    buyerRating: 4.8,
    tripsCompleted: 12,
    requestsCompleted: 7,
  },
  {
    id: "u_2",
    email: "jun.kai@example.com",
    fullName: "Jun Kai",
    avatarInitials: "JK",
    travelerRating: 4.7,
    buyerRating: 4.9,
    tripsCompleted: 5,
    requestsCompleted: 14,
  },
  {
    id: "u_3",
    email: "mina.rahman@example.com",
    fullName: "Mina Rahman",
    avatarInitials: "MR",
    travelerRating: 5.0,
    buyerRating: 4.6,
    tripsCompleted: 21,
    requestsCompleted: 3,
  },
  {
    id: "u_4",
    email: "paul.lee@example.com",
    fullName: "Paul Lee",
    avatarInitials: "PL",
    travelerRating: 4.8,
    buyerRating: 4.7,
    tripsCompleted: 9,
    requestsCompleted: 6,
  },
  {
    id: "u_5",
    email: "yumi.tan@example.com",
    fullName: "Yumi Tan",
    avatarInitials: "YT",
    travelerRating: 4.6,
    buyerRating: 5.0,
    tripsCompleted: 4,
    requestsCompleted: 11,
  },
  {
    id: "u_6",
    email: "byun.na@example.com",
    fullName: "Byun Na",
    avatarInitials: "BN",
    travelerRating: 4.9,
    buyerRating: 4.8,
    tripsCompleted: 15,
    requestsCompleted: 8,
  },
];

const requests: ItemRequest[] = [
  {
    id: "r_1",
    tripId: "t_1",
    buyer: users[1],
    itemName: "Maison Margiela Tabi flats",
    itemUrl: "https://example.com/tabi-flats",
    itemImageUrl: "",
    maxBudget: 950,
    courierFee: 60,
    status: "pending",
  },
  {
    id: "r_2",
    tripId: "t_1",
    buyer: users[4],
    itemName: "Diptyque candle 190g",
    itemUrl: "https://example.com/diptyque",
    itemImageUrl: "",
    maxBudget: 110,
    courierFee: 20,
    status: "pending",
  },
  {
    id: "r_3",
    tripId: "t_2",
    buyer: users[3],
    itemName: "Onitsuka Tiger Mexico 66",
    itemUrl: "https://example.com/onitsuka",
    itemImageUrl: "",
    maxBudget: 180,
    courierFee: 25,
    status: "accepted",
  },
];

const trips: Trip[] = [
  {
    id: "t_1",
    traveler: users[0],
    fromCountry: "Singapore",
    toCountry: "France",
    fromFlag: "🇸🇬",
    toFlag: "🇫🇷",
    departureDate: "2026-05-12",
    returnDate: "2026-05-22",
    capacityKg: 3,
    status: "open",
    requests: requests.filter((r) => r.tripId === "t_1"),
  },
  {
    id: "t_2",
    traveler: users[1],
    fromCountry: "Singapore",
    toCountry: "Japan",
    fromFlag: "🇸🇬",
    toFlag: "🇯🇵",
    departureDate: "2026-05-15",
    returnDate: "2026-05-25",
    capacityKg: 5,
    status: "open",
    requests: requests.filter((r) => r.tripId === "t_2"),
  },
  {
    id: "t_3",
    traveler: users[2],
    fromCountry: "Singapore",
    toCountry: "United Kingdom",
    fromFlag: "🇸🇬",
    toFlag: "🇬🇧",
    departureDate: "2026-05-20",
    returnDate: "2026-05-30",
    capacityKg: 2,
    status: "open",
    requests: [],
  },
  {
    id: "t_4",
    traveler: users[3],
    fromCountry: "United States",
    toCountry: "France",
    fromFlag: "🇺🇸",
    toFlag: "🇫🇷",
    departureDate: "2026-05-18",
    returnDate: "2026-05-28",
    capacityKg: 4,
    status: "open",
    requests: [],
  },
  {
    id: "t_5",
    traveler: users[4],
    fromCountry: "Australia",
    toCountry: "Japan",
    fromFlag: "🇦🇺",
    toFlag: "🇯🇵",
    departureDate: "2026-05-22",
    returnDate: "2026-06-02",
    capacityKg: 6,
    status: "open",
    requests: [],
  },
  {
    id: "t_6",
    traveler: users[5],
    fromCountry: "South Korea",
    toCountry: "France",
    fromFlag: "🇰🇷",
    toFlag: "🇫🇷",
    departureDate: "2026-05-25",
    returnDate: "2026-06-04",
    capacityKg: 3,
    status: "open",
    requests: [],
  },
];

const matches: Match[] = [
  {
    id: "m_1",
    requestId: "r_3",
    tripId: "t_2",
    status: "active",
    agreedPrice: 175,
    courierFee: 25,
  },
];

// The "current user" for dashboard / mode toggling — pretend the user is signed in as Alyssa.
const CURRENT_USER_ID = "u_1";

// TODO: replace with Supabase query
export async function getTrips(): Promise<Trip[]> {
  return trips;
}

// TODO: replace with Supabase query
export async function getTripById(id: string): Promise<Trip | null> {
  return trips.find((t) => t.id === id) ?? null;
}

// TODO: replace with Supabase query
export async function getRequestsForUser(userId: string): Promise<ItemRequest[]> {
  return requests.filter((r) => r.buyer.id === userId);
}

// TODO: replace with Supabase query
export async function getTripsForUser(userId: string): Promise<Trip[]> {
  return trips.filter((t) => t.traveler.id === userId);
}

// TODO: replace with Supabase query
export async function getUserById(id: string): Promise<User | null> {
  return users.find((u) => u.id === id) ?? null;
}

// TODO: replace with Supabase query
export async function getMatches(): Promise<Match[]> {
  return matches;
}

export function getCurrentUserId(): string {
  return CURRENT_USER_ID;
}

export function getDestinationCountries(): string[] {
  return Array.from(new Set(trips.map((t) => t.toCountry))).sort();
}
