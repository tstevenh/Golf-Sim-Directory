// State mappings - abbreviations to full names and vice versa
export const stateAbbrevToName: Record<string, string> = {
  al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas", ca: "california",
  co: "colorado", ct: "connecticut", de: "delaware", fl: "florida", ga: "georgia",
  hi: "hawaii", id: "idaho", il: "illinois", in: "indiana", ia: "iowa",
  ks: "kansas", ky: "kentucky", la: "louisiana", me: "maine", md: "maryland",
  ma: "massachusetts", mi: "michigan", mn: "minnesota", ms: "mississippi", mo: "missouri",
  mt: "montana", ne: "nebraska", nv: "nevada", nh: "new-hampshire", nj: "new-jersey",
  nm: "new-mexico", ny: "new-york", nc: "north-carolina", nd: "north-dakota", oh: "ohio",
  ok: "oklahoma", or: "oregon", pa: "pennsylvania", ri: "rhode-island", sc: "south-carolina",
  sd: "south-dakota", tn: "tennessee", tx: "texas", ut: "utah", vt: "vermont",
  va: "virginia", wa: "washington", wv: "west-virginia", wi: "wisconsin", wy: "wyoming",
  dc: "district-of-columbia",
};

export const stateNameToAbbrev: Record<string, string> = {
  alabama: "al", alaska: "ak", arizona: "az", arkansas: "ar", california: "ca",
  colorado: "co", connecticut: "ct", delaware: "de", florida: "fl", georgia: "ga",
  hawaii: "hi", idaho: "id", illinois: "il", indiana: "in", iowa: "ia",
  kansas: "ks", kentucky: "ky", louisiana: "la", maine: "me", maryland: "md",
  massachusetts: "ma", michigan: "mi", minnesota: "mn", mississippi: "ms", missouri: "mo",
  montana: "mt", nebraska: "ne", nevada: "nv", "new-hampshire": "nh", "new-jersey": "nj",
  "new-mexico": "nm", "new-york": "ny", "north-carolina": "nc", "north-dakota": "nd", ohio: "oh",
  oklahoma: "ok", oregon: "or", pennsylvania: "pa", "rhode-island": "ri", "south-carolina": "sc",
  "south-dakota": "sd", tennessee: "tn", texas: "tx", utah: "ut", vermont: "vt",
  virginia: "va", washington: "wa", "west-virginia": "wv", wisconsin: "wi", wyoming: "wy",
  "district-of-columbia": "dc",
};

export const stateAbbrevToDisplay: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia",
};

export function getStateAbbrevFromName(name: string): string | null {
  return stateNameToAbbrev[name.toLowerCase()] || null;
}

export function getStateNameFromAbbrev(abbrev: string): string | null {
  return stateAbbrevToName[abbrev.toLowerCase()] || null;
}

export function getStateDisplayName(abbrev: string): string {
  return stateAbbrevToDisplay[abbrev.toUpperCase()] || abbrev.toUpperCase();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}
