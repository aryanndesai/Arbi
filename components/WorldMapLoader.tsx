"use client";

import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] sm:h-[520px] bg-gray-900 rounded-2xl animate-pulse flex items-center justify-center">
      <span className="text-gray-600 text-sm">Loading map...</span>
    </div>
  ),
});

export default function WorldMapLoader() {
  return <WorldMap />;
}
