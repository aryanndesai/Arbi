"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMode } from "@/lib/use-mode";

type Props = {
  destinationCountries: string[];
};

export default function HeroSection({ destinationCountries }: Props) {
  const router = useRouter();
  const mode = useMode();
  const [country, setCountry] = useState("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!country) {
      router.push("/trips");
    } else {
      router.push(`/trips?to=${encodeURIComponent(country)}`);
    }
  }

  if (mode === "shopping") {
    return (
      <>
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] mb-3">
          Get anything from anywhere
        </h2>
        <p className="text-base sm:text-lg text-gray-500 mb-6">
          Find a traveler heading to the country you need. They bring it back
          for a small fee.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-md flex items-stretch gap-2 mb-6"
        >
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Where do you want items from?"
            className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-gray-900"
          >
            <option value="">Where do you want items from?</option>
            {destinationCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        <div className="flex gap-3 justify-center">
          <Link
            href="/trips"
            className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800"
          >
            Browse trips →
          </Link>
          <Link
            href="/post-trip"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50"
          >
            Post a request
          </Link>
        </div>
      </>
    );
  }

  // travelling (default)
  return (
    <>
      <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] mb-3">
        Turn your spare luggage into cash
      </h2>
      <p className="text-base sm:text-lg text-gray-500 mb-6">
        Post your trip. Accept requests. Earn a courier fee on items you bring
        back.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/post-trip"
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800"
        >
          Post a trip →
        </Link>
        <Link
          href="/trips"
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50"
        >
          Browse trips
        </Link>
      </div>
    </>
  );
}
