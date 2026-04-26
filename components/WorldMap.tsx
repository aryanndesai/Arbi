"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Map, Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";

// mapbox-gl v3 needs the token set on the singleton directly
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type City = {
  name: string;
  lng: number;
  lat: number;
  label: string;
};

const CITIES: City[] = [
  { name: "Singapore", lng: 103.8198, lat: 1.3521, label: "🇸🇬 Nike SG exclusives · LV · Streetwear" },
  { name: "Paris",     lng: 2.3522,   lat: 48.8566, label: "🇫🇷 LV · Chanel · Dior · VAT refund 12%" },
  { name: "Tokyo",     lng: 139.6503, lat: 35.6762, label: "🇯🇵 Palace · Bape · Nike JP exclusives" },
  { name: "London",    lng: -0.1278,  lat: 51.5074, label: "🇬🇧 Burberry · Supreme · New Balance" },
  { name: "New York",  lng: -74.006,  lat: 40.7128, label: "🇺🇸 Supreme · Kith · Jordan exclusives" },
  { name: "Los Angeles", lng: -118.2437, lat: 34.0522, label: "🇺🇸 Fear of God · Chrome Hearts · Travis" },
  { name: "Chicago",   lng: -87.6298, lat: 41.8781, label: "🇺🇸 Off-White · Jordan Brand HQ" },
  { name: "Las Vegas", lng: -115.1398, lat: 36.1699, label: "🇺🇸 Designer outlets · 60% off retail" },
  { name: "Milan",     lng: 9.1900,   lat: 45.4654, label: "🇮🇹 Prada · Versace · Moncler · VAT refund" },
  { name: "Rome",      lng: 12.4964,  lat: 41.9028, label: "🇮🇹 Gucci · Fendi · Valentino · VAT refund" },
  { name: "Shanghai",  lng: 121.4737, lat: 31.2304, label: "🇨🇳 Local streetwear · Li-Ning · Anta" },
];

const FLY_SEQUENCE = ["Singapore", "Paris", "Tokyo", "London", "New York", "Milan", "Shanghai"];

const FLIGHT_LINES = {
  type: "FeatureCollection" as const,
  features: [
    [[103.8198, 1.3521],  [2.3522, 48.8566]],
    [[139.6503, 35.6762], [-0.1278, 51.5074]],
    [[-74.006, 40.7128],  [103.8198, 1.3521]],
    [[-118.2437, 34.0522],[139.6503, 35.6762]],
    [[9.1900, 45.4654],   [121.4737, 31.2304]],
  ].map(([start, end]) => ({
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates: [start, end] },
    properties: {},
  })),
};

const WORLD_VIEW = { longitude: 10, latitude: 20, zoom: 1.5 };

export default function WorldMap() {
  const mapRef = useRef<MapRef>(null);
  const [popupCity, setPopupCity] = useState<City | null>(null);
  const flyIndexRef = useRef(0);
  const phaseRef = useRef<"city" | "world">("world");

  const closePopup = useCallback(() => setPopupCity(null), []);

  useEffect(() => {
    const tick = () => {
      const map = mapRef.current;
      if (!map) return;

      if (phaseRef.current === "world") {
        const cityName = FLY_SEQUENCE[flyIndexRef.current];
        const city = CITIES.find((c) => c.name === cityName)!;
        map.flyTo({ center: [city.lng, city.lat], zoom: 3, speed: 0.8 });
        setPopupCity(city);
        phaseRef.current = "city";
      } else {
        map.flyTo({ center: [WORLD_VIEW.longitude, WORLD_VIEW.latitude], zoom: WORLD_VIEW.zoom, speed: 0.8 });
        setPopupCity(null);
        flyIndexRef.current = (flyIndexRef.current + 1) % FLY_SEQUENCE.length;
        phaseRef.current = "world";
      }
    };

    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full">
      <div className="w-full h-[320px] sm:h-[520px] rounded-2xl overflow-hidden bg-[#0d1117]">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          initialViewState={WORLD_VIEW}
          scrollZoom={false}
          dragRotate={false}
          doubleClickZoom={false}
          touchZoomRotate={false}
          reuseMaps
          style={{ width: "100%", height: "100%" }}
        >
          <Source id="flights" type="geojson" data={FLIGHT_LINES}>
            <Layer
              id="flight-lines"
              type="line"
              paint={{
                "line-color": "#F59E0B",
                "line-opacity": 0.4,
                "line-width": 1,
                "line-dasharray": [4, 4],
              }}
            />
          </Source>

          {CITIES.map((city) => (
            <Marker
              key={city.name}
              longitude={city.lng}
              latitude={city.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupCity(city);
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#F59E0B",
                  cursor: "pointer",
                  animation: "arbi-pulse 2s ease-out infinite",
                }}
              />
            </Marker>
          ))}

          {popupCity && (
            <Popup
              longitude={popupCity.lng}
              latitude={popupCity.lat}
              anchor="bottom"
              offset={14}
              closeButton={false}
              onClose={closePopup}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: "7px 10px",
                  fontSize: 13,
                  color: "#111",
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
              >
                <button
                  onClick={closePopup}
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 5,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#888",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
                <span style={{ paddingRight: 14 }}>{popupCity.label}</span>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <p className="text-sm text-gray-400 text-center mt-3">
        ✈️ 11 cities · Exclusive items you can only get there · New trips posted daily
      </p>

      <style>{`
        @keyframes arbi-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
