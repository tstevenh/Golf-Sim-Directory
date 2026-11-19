import { Constants } from "@/types/supabase";

export type CorrectionValueResult =
  | { ok: true; value: string | number | null }
  | { ok: false; error: string };

const MANUAL =
  "Edit the venue by hand, then use \"Mark resolved\" on this report.";

const ENUM_FIELDS: Record<string, readonly string[]> = {
  venueType: Constants.public.Enums.VenueType,
  launchMonitorType: Constants.public.Enums.LaunchMonitorType,
  pricingModel: Constants.public.Enums.PricingModel,
  parking: Constants.public.Enums.ParkingType,
};

const INT_FIELDS = new Set([
  "bayCount",
  "priceRangeMin",
  "priceRangeMax",
  "privateRoomsCount",
  "maxGroupSizePerBay",
]);

// Short single-line fields. Long free text here is almost always an instruction
// ("Please change the name to ...") rather than the value itself.
const SHORT_TEXT_FIELDS: Record<string, number> = {
  name: 120,
  address: 200,
  city: 80,
  phone: 30,
};

const URL_FIELDS = new Set(["website", "bookingUrl"]);

// Matches the pipe-delimited format the venue page and schema expect, e.g.
// "mon:9AM-10PM|tue:9AM-10PM|...".
const HOURS_RE =
  /^(sun|mon|tue|wed|thu|fri|sat):[^|]+(\|(sun|mon|tue|wed|thu|fri|sat):[^|]+)*$/i;

const looksLikeInstruction = (s: string) =>
  /^(please|pls|can you|could you|change|update|replace|remove|set|confirm)\b/i.test(s);

/**
 * Turn a reporter's suggested value into something safe to write to the venue column.
 * Returns an error when the value can't be applied automatically, so the admin edits
 * the venue by hand instead of writing the reporter's sentence into the listing.
 */
export function toVenueValue(field: string, raw: string | null): CorrectionValueResult {
  const value = (raw ?? "").trim();

  if (!value) return { ok: false, error: `The suggested value is empty. ${MANUAL}` };

  if (field in ENUM_FIELDS) {
    const allowed = ENUM_FIELDS[field];
    const key = value.toLowerCase().replace(/[\s-]+/g, "_");
    if (allowed.includes(key)) return { ok: true, value: key };
    return {
      ok: false,
      error: `"${value}" isn't a valid ${field}. Allowed values: ${allowed.join(", ")}. ${MANUAL}`,
    };
  }

  if (INT_FIELDS.has(field)) {
    if (!/^\$?\d+$/.test(value)) {
      return { ok: false, error: `"${value}" isn't a whole number for ${field}. ${MANUAL}` };
    }
    return { ok: true, value: parseInt(value.replace("$", ""), 10) };
  }

  if (field === "zipCode") {
    if (!/^\d{5}(-\d{4})?$/.test(value)) {
      return { ok: false, error: `"${value}" isn't a valid ZIP code. ${MANUAL}` };
    }
    return { ok: true, value };
  }

  if (field === "state") {
    if (!/^[A-Za-z]{2}$/.test(value)) {
      return { ok: false, error: `State must be a 2-letter code, got "${value}". ${MANUAL}` };
    }
    return { ok: true, value: value.toUpperCase() };
  }

  if (field === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { ok: false, error: `"${value}" isn't a valid email address. ${MANUAL}` };
    }
    return { ok: true, value };
  }

  if (URL_FIELDS.has(field)) {
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      return { ok: true, value: url.toString() };
    } catch {
      return { ok: false, error: `"${value}" isn't a valid http(s) URL. ${MANUAL}` };
    }
  }

  if (field === "hours") {
    if (!HOURS_RE.test(value)) {
      return {
        ok: false,
        error: `Hours must be in the "mon:9AM-10PM|tue:..." format. ${MANUAL}`,
      };
    }
    return { ok: true, value };
  }

  // The address column is the street line only; city, state and ZIP live in their own columns.
  if (field === "address" && /,\s*[A-Za-z]{2}\s+\d{5}(-\d{4})?\s*$/.test(value)) {
    return {
      ok: false,
      error: `Address should be the street line only, without city, state and ZIP. ${MANUAL}`,
    };
  }

  if (field in SHORT_TEXT_FIELDS) {
    if (value.length > SHORT_TEXT_FIELDS[field] || /\n/.test(value) || looksLikeInstruction(value)) {
      return {
        ok: false,
        error: `This looks like a request rather than the new ${field} itself. ${MANUAL}`,
      };
    }
    return { ok: true, value };
  }

  if (field === "about") {
    if (looksLikeInstruction(value)) {
      return {
        ok: false,
        error: `This looks like a request rather than the new description itself. ${MANUAL}`,
      };
    }
    return { ok: true, value };
  }

  // "other" and anything unexpected has no single column to write to.
  return {
    ok: false,
    error: `"${field}" reports can't be applied automatically. ${MANUAL}`,
  };
}
