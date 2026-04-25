type CountryStyle = {
  flag: string;
  tintClass: string;
  borderClass: string;
};

const COUNTRY_MAP: Record<string, CountryStyle> = {
  france: {
    flag: "🇫🇷",
    tintClass: "bg-gradient-to-br from-blue-50/70 to-white",
    borderClass: "border-blue-100",
  },
  japan: {
    flag: "🇯🇵",
    tintClass: "bg-gradient-to-br from-pink-50/70 to-white",
    borderClass: "border-pink-100",
  },
  "united kingdom": {
    flag: "🇬🇧",
    tintClass: "bg-gradient-to-br from-purple-50/70 to-white",
    borderClass: "border-purple-100",
  },
  uk: {
    flag: "🇬🇧",
    tintClass: "bg-gradient-to-br from-purple-50/70 to-white",
    borderClass: "border-purple-100",
  },
  "united states": {
    flag: "🇺🇸",
    tintClass: "bg-gradient-to-br from-red-50/70 to-white",
    borderClass: "border-red-100",
  },
  usa: {
    flag: "🇺🇸",
    tintClass: "bg-gradient-to-br from-red-50/70 to-white",
    borderClass: "border-red-100",
  },
  us: {
    flag: "🇺🇸",
    tintClass: "bg-gradient-to-br from-red-50/70 to-white",
    borderClass: "border-red-100",
  },
  singapore: {
    flag: "🇸🇬",
    tintClass: "bg-gradient-to-br from-emerald-50/70 to-white",
    borderClass: "border-emerald-100",
  },
  "south korea": {
    flag: "🇰🇷",
    tintClass: "bg-gradient-to-br from-amber-50/70 to-white",
    borderClass: "border-amber-100",
  },
  korea: {
    flag: "🇰🇷",
    tintClass: "bg-gradient-to-br from-amber-50/70 to-white",
    borderClass: "border-amber-100",
  },
  australia: {
    flag: "🇦🇺",
    tintClass: "bg-gradient-to-br from-orange-50/70 to-white",
    borderClass: "border-orange-100",
  },
  germany: {
    flag: "🇩🇪",
    tintClass: "bg-gradient-to-br from-yellow-50/70 to-white",
    borderClass: "border-yellow-100",
  },
  italy: {
    flag: "🇮🇹",
    tintClass: "bg-gradient-to-br from-green-50/70 to-white",
    borderClass: "border-green-100",
  },
  spain: {
    flag: "🇪🇸",
    tintClass: "bg-gradient-to-br from-rose-50/70 to-white",
    borderClass: "border-rose-100",
  },
  thailand: {
    flag: "🇹🇭",
    tintClass: "bg-gradient-to-br from-indigo-50/70 to-white",
    borderClass: "border-indigo-100",
  },
  india: {
    flag: "🇮🇳",
    tintClass: "bg-gradient-to-br from-orange-50/70 to-white",
    borderClass: "border-orange-100",
  },
  china: {
    flag: "🇨🇳",
    tintClass: "bg-gradient-to-br from-red-50/70 to-white",
    borderClass: "border-red-100",
  },
  canada: {
    flag: "🇨🇦",
    tintClass: "bg-gradient-to-br from-rose-50/70 to-white",
    borderClass: "border-rose-100",
  },
};

const FALLBACK: CountryStyle = {
  flag: "🌍",
  tintClass: "bg-white",
  borderClass: "border-gray-100",
};

export function getCountryStyle(country: string): CountryStyle {
  return COUNTRY_MAP[country.trim().toLowerCase()] ?? FALLBACK;
}

export function getCountryFlag(country: string): string {
  return getCountryStyle(country).flag;
}
