"use client";

import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";

type City = { name: string; lat: number; lng: number; flag: string; item: string };

const CITIES: City[] = [
  // Asia
  { name: "Singapore",    lat:  1.3521,  lng: 103.8198,  flag: "🇸🇬", item: "Nike SG exclusives · Streetwear" },
  { name: "Tokyo",        lat: 35.6762,  lng: 139.6503,  flag: "🇯🇵", item: "Palace · Bape · Nike JP exclusives" },
  // Europe (kept lean — arcs fan outward, not inward)
  { name: "London",       lat: 51.5074,  lng:  -0.1278,  flag: "🇬🇧", item: "Burberry · Supreme · New Balance" },
  { name: "Paris",        lat: 48.8566,  lng:   2.3522,  flag: "🇫🇷", item: "Louis Vuitton · Chanel · VAT refund" },
  { name: "Milan",        lat: 45.4654,  lng:   9.1900,  flag: "🇮🇹", item: "Prada · Versace · Moncler" },
  // Americas
  { name: "New York",     lat: 40.7128,  lng: -74.0060,  flag: "🇺🇸", item: "Supreme · Kith · Jordan exclusives" },
  { name: "Los Angeles",  lat: 34.0522,  lng: -118.2437, flag: "🇺🇸", item: "Fear of God · Chrome Hearts · Travis" },
  { name: "Miami",        lat: 25.7617,  lng: -80.1918,  flag: "🇺🇸", item: "Versace Miami · streetwear · sneakers" },
  { name: "Toronto",      lat: 43.6532,  lng: -79.3832,  flag: "🇨🇦", item: "OVO · Canada Goose · Roots" },
  { name: "Mexico City",  lat: 19.4326,  lng: -99.1332,  flag: "🇲🇽", item: "Carhartt · vintage · local designers" },
  { name: "São Paulo",    lat: -23.5505, lng: -46.6333,  flag: "🇧🇷", item: "Havaianas · local streetwear · gems" },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816,  flag: "🇦🇷", item: "Leather goods · Malbec · crafts" },
  // Africa
  { name: "Cairo",        lat: 30.0444,  lng:  31.2357,  flag: "🇪🇬", item: "Gold · Handcrafted goods · Spices" },
  { name: "Casablanca",   lat: 33.5731,  lng:  -7.5898,  flag: "🇲🇦", item: "Leather · Argan oil · Rugs" },
  { name: "Cape Town",    lat: -33.9249, lng:  18.4241,  flag: "🇿🇦", item: "African craft · Diamonds · Wine" },
  // Oceania
  { name: "Sydney",       lat: -33.8688, lng: 151.2093,  flag: "🇦🇺", item: "UGG · surf brands · Akubra hats" },
  { name: "Auckland",     lat: -36.8509, lng: 174.7645,  flag: "🇳🇿", item: "All Blacks merch · Merino wool · Manuka" },
];

// per-city label altitude — stagger close cities so labels don't collide
const LABEL_ALTITUDE: Record<string, number> = {
  London:      0.10,
  Paris:       0.05,
  Milan:       0.07,
  Cairo:       0.08,
  Casablanca:  0.06,
  Toronto:     0.09,
  "New York":  0.05,
  Miami:       0.07,
  "São Paulo": 0.08,
  "Buenos Aires": 0.05,
  Sydney:      0.05,
  Auckland:    0.08,
};
const DEFAULT_LABEL_ALTITUDE = 0.05;

type Arc = { startLat: number; startLng: number; endLat: number; endLng: number; color: string };
const C = (name: string): City => CITIES.find((c) => c.name === name)!;
const ARC = (a: string, b: string): Arc => ({
  startLat: C(a).lat, startLng: C(a).lng,
  endLat:   C(b).lat, endLng:   C(b).lng,
  color: "#F59E0B",
});

const ARCS: Arc[] = [
  ARC("Singapore",   "London"),       // Asia → Europe
  ARC("Singapore",   "São Paulo"),    // Asia → South America
  ARC("Tokyo",       "New York"),     // transpacific
  ARC("Tokyo",       "Auckland"),     // Japan → NZ
  ARC("Los Angeles", "Sydney"),       // Pacific diagonal
  ARC("London",      "New York"),     // transatlantic
  ARC("Paris",       "Singapore"),    // Europe → Asia
  ARC("Milan",       "Cape Town"),    // Europe → Africa
  ARC("Miami",       "Cairo"),        // Americas → Africa
  ARC("Toronto",     "London"),       // Canada → UK
  ARC("São Paulo",   "London"),       // South America → Europe
  ARC("Buenos Aires","Tokyo"),        // South America → Asia
  ARC("Cairo",       "Singapore"),    // Africa → Asia
  ARC("Casablanca",  "New York"),     // Morocco → Americas
  ARC("Cape Town",   "Sydney"),       // Africa → Oceania
  ARC("Sydney",      "London"),       // Australia → UK
];

export default function GlobeInner() {
  const globeRef     = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth || 800);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 15, lng: 25, altitude: 1.8 }, 0);
    const controls = globeRef.current.controls();
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom      = false;
    controls.enablePan       = false;
  }, [width]);

  return (
    <div ref={containerRef} style={{ width: "100%", background: "#000008", lineHeight: 0 }}>
      <Globe
        ref={globeRef}
        width={width}
        height={Math.round(Math.max(560, Math.min(820, width * 0.72)))}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#60A5FA"
        atmosphereAltitude={0.12}
        pointsData={CITIES}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#F59E0B"}
        pointAltitude={0.02}
        pointRadius={0.5}
        pointLabel={(d) => {
          const c = d as City;
          return `<div style="background:white;padding:8px 12px;border-radius:8px;font-size:13px;font-family:sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:200px;"><strong>${c.flag} ${c.name}</strong><br/><span style="color:#6B7280;font-size:11px;">${c.item}</span></div>`;
        }}
        arcsData={ARCS}
        arcColor="color"
        arcAltitude={0.5}
        arcStroke={1.0}
        arcDashLength={0.4}
        arcDashGap={0.15}
        arcDashAnimateTime={6000}
        labelsData={CITIES}
        labelLat="lat"
        labelLng="lng"
        labelText={(d) => { const c = d as City; return `${c.flag} ${c.name}`; }}
        labelSize={0.7}
        labelColor={() => "rgba(255,255,255,0.9)"}
        labelDotRadius={0.3}
        labelAltitude={(d) => {
          const c = d as City;
          return LABEL_ALTITUDE[c.name] ?? DEFAULT_LABEL_ALTITUDE;
        }}
        labelResolution={2}
      />
    </div>
  );
}
