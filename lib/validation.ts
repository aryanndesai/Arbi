type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type TripPayload = {
  fromCountry: string;
  toCountry: string;
  fromFlag?: string;
  toFlag?: string;
  departureDate: string;
  returnDate: string;
  capacityKg: number;
};

type RequestPayload = {
  tripId: string;
  itemName: string;
  itemUrl: string;
  itemImageUrl?: string;
  maxBudget: number;
  courierFee: number;
};

type MatchPayload = {
  requestId: string;
  tripId: string;
  agreedPrice: number;
  courierFee: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function readOptionalUrl(value: unknown, field: string): ValidationResult<string> {
  if (value === undefined || value === null || value === "") {
    return { ok: true, data: "" };
  }
  return readUrl(value, field);
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function readDate(value: unknown, field: string): ValidationResult<string> {
  const stringResult = readString(value, field, 10);
  if (!stringResult.ok) return stringResult;
  if (!isIsoDate(stringResult.data)) {
    return { ok: false, error: `${field} must be in YYYY-MM-DD format` };
  }
  return stringResult;
}

export function readSafeHttpUrl(
  value: unknown,
  field: string
): ValidationResult<string> {
  if (typeof value !== "string") {
    return { ok: false, error: `${field} must be a string` };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: `${field} is required` };
  }
  if (trimmed.length > 2048) {
    return { ok: false, error: `${field} is too long` };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: `${field} must use http or https` };
    }
    return { ok: true, data: parsed.toString() };
  } catch {
    return { ok: false, error: `${field} must be a valid URL` };
  }
}

function readUrl(value: unknown, field: string): ValidationResult<string> {
  return readSafeHttpUrl(value, field);
}

function readEntityId(value: unknown, field: string): ValidationResult<string> {
  const idResult = readString(value, field, 128);
  if (!idResult.ok) return idResult;
  if (!/^[a-z]_[a-zA-Z0-9_-]+$/.test(idResult.data)) {
    return { ok: false, error: `${field} has an invalid format` };
  }
  return idResult;
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
  const returnDate = readDate(body.returnDate, "returnDate");
  if (!returnDate.ok) return returnDate;
  const capacityKg = readNumber(body.capacityKg, "capacityKg", 0.1, 50);
  if (!capacityKg.ok) return capacityKg;

  if (departureDate.data > returnDate.data) {
    return { ok: false, error: "departureDate must be on or before returnDate" };
  }

  const fromFlag =
    body.fromFlag === undefined ? undefined : readString(body.fromFlag, "fromFlag", 8);
  if (fromFlag && !fromFlag.ok) return fromFlag;
  const toFlag =
    body.toFlag === undefined ? undefined : readString(body.toFlag, "toFlag", 8);
  if (toFlag && !toFlag.ok) return toFlag;

  return {
    ok: true,
    data: {
      fromCountry: fromCountry.data,
      toCountry: toCountry.data,
      fromFlag: fromFlag?.ok ? fromFlag.data : undefined,
      toFlag: toFlag?.ok ? toFlag.data : undefined,
      departureDate: departureDate.data,
      returnDate: returnDate.data,
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

  const tripId = readEntityId(body.tripId, "tripId");
  if (!tripId.ok) return tripId;
  const itemName = readString(body.itemName, "itemName", 200);
  if (!itemName.ok) return itemName;
  const itemUrl = readUrl(body.itemUrl, "itemUrl");
  if (!itemUrl.ok) return itemUrl;
  const itemImageUrl = readOptionalUrl(body.itemImageUrl, "itemImageUrl");
  if (!itemImageUrl.ok) return itemImageUrl;
  const maxBudget = readNumber(body.maxBudget, "maxBudget", 1, 1_000_000);
  if (!maxBudget.ok) return maxBudget;
  const courierFee = readNumber(body.courierFee, "courierFee", 0, 1_000_000);
  if (!courierFee.ok) return courierFee;

  return {
    ok: true,
    data: {
      tripId: tripId.data,
      itemName: itemName.data,
      itemUrl: itemUrl.data,
      itemImageUrl: itemImageUrl.data || undefined,
      maxBudget: maxBudget.data,
      courierFee: courierFee.data,
    },
  };
}

export function validateMatchPayload(body: unknown): ValidationResult<MatchPayload> {
  if (!isObject(body)) {
    return { ok: false, error: "Invalid match payload" };
  }

  const requestId = readEntityId(body.requestId, "requestId");
  if (!requestId.ok) return requestId;
  const tripId = readEntityId(body.tripId, "tripId");
  if (!tripId.ok) return tripId;
  const agreedPrice = readNumber(body.agreedPrice, "agreedPrice", 0, 1_000_000);
  if (!agreedPrice.ok) return agreedPrice;
  const courierFee = readNumber(body.courierFee, "courierFee", 0, 1_000_000);
  if (!courierFee.ok) return courierFee;

  return {
    ok: true,
    data: {
      requestId: requestId.data,
      tripId: tripId.data,
      agreedPrice: agreedPrice.data,
      courierFee: courierFee.data,
    },
  };
}
