// Request-body validation for the API routes. Ported from the
// copilot/analyse-code-for-improvements branch and adapted to this schema
// (UUID primary keys, Clerk user ids). Every validator returns either the
// cleaned data or a human-readable error the client can show directly.

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type TripPayload = {
  fromCountry: string;
  toCountry: string;
  departureDate: string;
  returnDate: string | null;
  capacityKg: number;
};

export type RequestPayload = {
  tripId: string;
  itemName: string;
  itemUrl: string;
  itemImageUrl: string | null;
  maxBudget: number;
  courierFee: number;
};

export type MatchPayload = {
  requestId: string;
  agreedPrice: number;
  courierFee: number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres rejects malformed UUIDs with a 500-worthy error, so callers check
// this first and turn bad ids into a clean 404/400.
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  value: unknown,
  field: string,
  maxLength: number
): ValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: `${field} must be a string` };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: `${field} is required` };
  }
  if (trimmed.length > maxLength) {
    return { ok: false, error: `${field} is too long` };
  }
  return { ok: true, data: trimmed };
}

function readNumber(
  value: unknown,
  field: string,
  min: number,
  max: number
): ValidationResult<number> {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { ok: false, error: `${field} must be a valid number` };
  }
  if (value < min || value > max) {
    return { ok: false, error: `${field} must be between ${min} and ${max}` };
  }
  return { ok: true, data: value };
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function readDate(value: unknown, field: string): ValidationResult<string> {
  const result = readString(value, field, 10);
  if (!result.ok) return result;
  if (!isIsoDate(result.data)) {
    return { ok: false, error: `${field} must be in YYYY-MM-DD format` };
  }
  return result;
}

function isBlank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

// Only http(s) links are stored — these are rendered as <a href> elsewhere,
// so a javascript: or data: URL would be a stored-XSS vector.
export function readSafeHttpUrl(
  value: unknown,
  field: string
): ValidationResult<string> {
  const result = readString(value, field, 2048);
  if (!result.ok) return result;
  try {
    const parsed = new URL(result.data);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: `${field} must use http or https` };
    }
    return { ok: true, data: parsed.toString() };
  } catch {
    return { ok: false, error: `${field} must be a valid URL` };
  }
}

// One day of slack so a traveller west of UTC can still pick "today".
function earliestDepartureIso(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function validateTripPayload(body: unknown): ValidationResult<TripPayload> {
  if (!isObject(body)) {
    return { ok: false, error: "Invalid trip payload" };
  }

  const fromCountry = readString(body.fromCountry, "fromCountry", 80);
  if (!fromCountry.ok) return fromCountry;
  const toCountry = readString(body.toCountry, "toCountry", 80);
  if (!toCountry.ok) return toCountry;
  const departureDate = readDate(body.departureDate, "departureDate");
  if (!departureDate.ok) return departureDate;
  const capacityKg = readNumber(body.capacityKg, "capacityKg", 0.1, 50);
  if (!capacityKg.ok) return capacityKg;

  let returnDate: string | null = null;
  if (!isBlank(body.returnDate)) {
    const parsed = readDate(body.returnDate, "returnDate");
    if (!parsed.ok) return parsed;
    if (parsed.data < departureDate.data) {
      return { ok: false, error: "Return date must be on or after the departure date" };
    }
    returnDate = parsed.data;
  }

  if (fromCountry.data.toLowerCase() === toCountry.data.toLowerCase()) {
    return { ok: false, error: "Origin and destination must be different" };
  }
  if (departureDate.data < earliestDepartureIso()) {
    return { ok: false, error: "Departure date can't be in the past" };
  }

  return {
    ok: true,
    data: {
      fromCountry: fromCountry.data,
      toCountry: toCountry.data,
      departureDate: departureDate.data,
      returnDate,
      capacityKg: capacityKg.data,
    },
  };
}

export function validateRequestPayload(
  body: unknown
): ValidationResult<RequestPayload> {
  if (!isObject(body)) {
    return { ok: false, error: "Invalid request payload" };
  }

  if (!isUuid(body.tripId)) {
    return { ok: false, error: "tripId is invalid" };
  }
  const itemName = readString(body.itemName, "itemName", 200);
  if (!itemName.ok) return itemName;
  const itemUrl = readSafeHttpUrl(body.itemUrl, "itemUrl");
  if (!itemUrl.ok) return itemUrl;

  let itemImageUrl: string | null = null;
  if (!isBlank(body.itemImageUrl)) {
    const parsed = readSafeHttpUrl(body.itemImageUrl, "itemImageUrl");
    if (!parsed.ok) return parsed;
    itemImageUrl = parsed.data;
  }

  const maxBudget = readNumber(body.maxBudget, "maxBudget", 1, 1_000_000);
  if (!maxBudget.ok) return maxBudget;
  const courierFee = readNumber(body.courierFee, "courierFee", 0, 1_000_000);
  if (!courierFee.ok) return courierFee;

  return {
    ok: true,
    data: {
      tripId: body.tripId,
      itemName: itemName.data,
      itemUrl: itemUrl.data,
      itemImageUrl,
      maxBudget: maxBudget.data,
      courierFee: courierFee.data,
    },
  };
}

export function validateMatchPayload(body: unknown): ValidationResult<MatchPayload> {
  if (!isObject(body)) {
    return { ok: false, error: "Invalid match payload" };
  }

  if (!isUuid(body.requestId)) {
    return { ok: false, error: "requestId is invalid" };
  }
  const agreedPrice = readNumber(body.agreedPrice, "agreedPrice", 0, 1_000_000);
  if (!agreedPrice.ok) return agreedPrice;
  const courierFee = readNumber(body.courierFee, "courierFee", 0, 1_000_000);
  if (!courierFee.ok) return courierFee;

  return {
    ok: true,
    data: {
      requestId: body.requestId,
      agreedPrice: agreedPrice.data,
      courierFee: courierFee.data,
    },
  };
}
