import {
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  travelerRating: real("traveler_rating").notNull().default(5.0),
  buyerRating: real("buyer_rating").notNull().default(5.0),
  tripsCompleted: integer("trips_completed").notNull().default(0),
  requestsCompleted: integer("requests_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trips = pgTable("trips", {
  id: text("id").primaryKey(),
  travelerId: text("traveler_id")
    .notNull()
    .references(() => users.id),
  fromCountry: text("from_country").notNull(),
  toCountry: text("to_country").notNull(),
  fromFlag: text("from_flag").notNull().default("🌍"),
  toFlag: text("to_flag").notNull().default("🌍"),
  departureDate: text("departure_date").notNull(),
  returnDate: text("return_date").notNull(),
  capacityKg: real("capacity_kg").notNull(),
  status: text("status", {
    enum: ["open", "matched", "in_transit", "delivered", "cancelled"],
  })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const itemRequests = pgTable("item_requests", {
  id: text("id").primaryKey(),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id),
  itemName: text("item_name").notNull(),
  itemUrl: text("item_url").notNull().default(""),
  itemImageUrl: text("item_image_url").notNull().default(""),
  maxBudget: real("max_budget").notNull(),
  courierFee: real("courier_fee").notNull(),
  status: text("status", {
    enum: ["open", "accepted", "purchased", "delivered", "cancelled"],
  })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .notNull()
    .references(() => itemRequests.id),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id),
  status: text("status", {
    enum: ["pending", "agreed", "paid", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
  agreedPrice: real("agreed_price").notNull(),
  courierFee: real("courier_fee").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  matchId: text("match_id")
    .notNull()
    .references(() => matches.id),
  raterId: text("rater_id")
    .notNull()
    .references(() => users.id),
  rateeId: text("ratee_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
