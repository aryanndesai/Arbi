import {
  uuid,
  text,
  decimal,
  integer,
  date,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';

// users.id stores Clerk user IDs (e.g. "user_2abc123") — text, not uuid
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  avatarInitials: text('avatar_initials'),
  travelerRating: decimal('traveler_rating', { precision: 3, scale: 1 }).default('5.0'),
  buyerRating: decimal('buyer_rating', { precision: 3, scale: 1 }).default('5.0'),
  tripsCompleted: integer('trips_completed').default(0),
  requestsCompleted: integer('requests_completed').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  travelerId: text('traveler_id').references(() => users.id),
  fromCountry: text('from_country').notNull(),
  toCountry: text('to_country').notNull(),
  fromFlag: text('from_flag'),
  toFlag: text('to_flag'),
  departureDate: date('departure_date').notNull(),
  returnDate: date('return_date'),
  capacityKg: decimal('capacity_kg', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const itemRequests = pgTable('item_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').references(() => trips.id),
  buyerId: text('buyer_id').references(() => users.id),
  itemName: text('item_name').notNull(),
  itemUrl: text('item_url'),
  itemImageUrl: text('item_image_url'),
  maxBudget: decimal('max_budget', { precision: 10, scale: 2 }).notNull(),
  courierFee: decimal('courier_fee', { precision: 10, scale: 2 }),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: uuid('request_id').references(() => itemRequests.id),
  tripId: uuid('trip_id').references(() => trips.id),
  status: text('status').default('active'),
  agreedPrice: decimal('agreed_price', { precision: 10, scale: 2 }),
  courierFee: decimal('courier_fee', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id),
  raterId: text('rater_id').references(() => users.id),
  rateeId: text('ratee_id').references(() => users.id),
  rating: decimal('rating', { precision: 3, scale: 1 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

export type ItemRequest = typeof itemRequests.$inferSelect;
export type NewItemRequest = typeof itemRequests.$inferInsert;

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
