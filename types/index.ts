export type UserMode = "travelling" | "shopping";

export type TripStatus = "open" | "matched" | "in_transit" | "delivered" | "cancelled";

export type RequestStatus = "open" | "accepted" | "purchased" | "delivered" | "cancelled";

export type MatchStatus = "pending" | "agreed" | "paid" | "delivered" | "cancelled";

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarInitials: string;
  travelerRating: number;
  buyerRating: number;
  tripsCompleted: number;
  requestsCompleted: number;
}

export interface Trip {
  id: string;
  traveler: User;
  fromCountry: string;
  toCountry: string;
  fromFlag: string;
  toFlag: string;
  departureDate: string;
  returnDate: string;
  capacityKg: number;
  status: TripStatus;
  requests: ItemRequest[];
}

export interface ItemRequest {
  id: string;
  tripId: string;
  buyer: User;
  itemName: string;
  itemUrl: string;
  itemImageUrl: string;
  maxBudget: number;
  courierFee: number;
  status: RequestStatus;
}

export interface Match {
  id: string;
  requestId: string;
  tripId: string;
  status: MatchStatus;
  agreedPrice: number;
  courierFee: number;
}
