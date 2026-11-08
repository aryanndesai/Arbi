export type UserMode = "travelling" | "shopping";

export type RequestStatus = "pending" | "accepted" | "declined" | "completed";

export type TripStatus = "open" | "full" | "in_transit" | "completed";

export type MatchStatus = "active" | "delivered" | "disputed" | "completed";

// Lightweight trip shape for list views (home, browse, profile) — carries a
// request count instead of the full nested request objects those pages don't need.
export interface TripSummary {
  id: string;
  traveler: {
    id: string;
    fullName: string;
    avatarInitials: string;
    travelerRating: number;
    tripsCompleted: number;
  };
  fromCountry: string;
  toCountry: string;
  fromFlag: string;
  toFlag: string;
  departureDate: string;
  capacityKg: number;
  status: TripStatus;
  requestCount: number;
}
