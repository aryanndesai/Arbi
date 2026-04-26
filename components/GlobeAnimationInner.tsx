"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

type City = {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
};

const CITIES: City[] = [
  { id: "sin", name: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198 },
  { id: "par", name: "Paris", flag: "🇫🇷", lat: 48.8566, lng: 2.3522 },
  { id: "tko", name: "Tokyo", flag: "🇯🇵", lat: 35.6762, lng: 139.6503 },
  { id: "lon", name: "London", flag: "🇬🇧", lat: 51.5074, lng: -0.1278 },
];

type Arc = {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startCity: City;
  endCity: City;
};

const ARCS: Arc[] = CITIES.map((from, i) => {
  const to = CITIES[(i + 1) % CITIES.length];
  return {
    id: `${from.id}-${to.id}`,
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    startCity: from,
    endCity: to,
  };
});

const AMBER = "#f5b04a";
const AMBER_SOFT = "rgba(245,176,74,0.35)";
const ARC_LEG_MS = 4500;

function greatCircleInterpolate(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  t: number
): { lat: number; lng: number } {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const lat1 = start.lat * toRad;
  const lng1 = start.lng * toRad;
  const lat2 = end.lat * toRad;
  const lng2 = end.lng * toRad;

  const dLat = (lat2 - lat1) / 2;
  const dLng = (lng2 - lng1) / 2;
  const a =
    Math.sin(dLat) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng) ** 2;
  const d = 2 * Math.asin(Math.min(1, Math.sqrt(a)));

  if (d === 0) return { lat: start.lat, lng: start.lng };

  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);

  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  return {
    lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * toDeg,
    lng: Math.atan2(y, x) * toDeg,
  };
}

function bearing(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): number {
  const toRad = Math.PI / 180;
  const lat1 = start.lat * toRad;
  const lat2 = end.lat * toRad;
  const dLng = (end.lng - start.lng) * toRad;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export default function GlobeAnimationInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ width: 520, height: 440 });
  const [activeIdx, setActiveIdx] = useState(0);
  const [plane, setPlane] = useState<{ lat: number; lng: number; rot: number }>({
    lat: ARCS[0].startLat,
    lng: ARCS[0].startLng,
    rot: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const cw = Math.min(Math.max(w, 260), 560);
      setSize({ width: cw, height: Math.round(cw * 0.85) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    g.pointOfView({ lat: 20, lng: 30, altitude: 2.4 }, 0);
  }, [size.width]);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % ARCS.length);
    }, ARC_LEG_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    const startTs = performance.now();
    const arc = ARCS[activeIdx];
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTs) / ARC_LEG_MS);
      const pos = greatCircleInterpolate(
        { lat: arc.startLat, lng: arc.startLng },
        { lat: arc.endLat, lng: arc.endLng },
        t
      );
      const ahead = greatCircleInterpolate(
        { lat: arc.startLat, lng: arc.startLng },
        { lat: arc.endLat, lng: arc.endLng },
        Math.min(1, t + 0.01)
      );
      setPlane({ lat: pos.lat, lng: pos.lng, rot: bearing(pos, ahead) });
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIdx]);

  const globeMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color("#0f1f3d"),
      emissive: new THREE.Color("#0a1730"),
      emissiveIntensity: 0.25,
      shininess: 6,
    });
  }, []);

  const ringsData = useMemo(
    () =>
      CITIES.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        maxR: 4,
        propagationSpeed: 2,
        repeatPeriod: 1600,
      })),
    []
  );

  const labelsHtml = useMemo(
    () =>
      CITIES.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        html: `<div style="
          background: white;
          color: #0a1f44;
          font: 500 11.5px/1.4 system-ui, -apple-system, 'Segoe UI Emoji', sans-serif;
          padding: 3px 9px;
          border-radius: 999px;
          box-shadow: 0 1px 3px rgba(10,31,68,0.18);
          white-space: nowrap;
          transform: translate(10px, -120%);
          pointer-events: none;
        ">${c.flag} ${c.name}</div>`,
      })),
    []
  );

  const planeHtml = useMemo(
    () => [
      {
        lat: plane.lat,
        lng: plane.lng,
        rot: plane.rot,
        html: `<div style="
          transform: translate(-50%, -50%) rotate(${plane.rot - 90}deg);
          font-size: 18px;
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
          pointer-events: none;
        ">✈️</div>`,
      },
    ],
    [plane]
  );

  const htmlElements = useMemo(
    () => [...labelsHtml, ...planeHtml],
    [labelsHtml, planeHtml]
  );

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-[560px]"
      style={{ height: size.height }}
      role="img"
      aria-label="Animated 3D globe with a plane flying between Singapore, Paris, Tokyo, and London"
    >
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        showAtmosphere
        atmosphereColor="#7aa2ff"
        atmosphereAltitude={0.18}
        showGraticules
        ringsData={ringsData}
        ringColor={() => AMBER}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        pointsData={CITIES}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#ffffff"}
        pointAltitude={0.012}
        pointRadius={0.32}
        pointResolution={16}
        arcsData={ARCS}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcAltitude={0.32}
        arcStroke={0.45}
        arcColor={(d: object) =>
          (d as Arc).id === ARCS[activeIdx].id ? AMBER : AMBER_SOFT
        }
        arcDashLength={0.35}
        arcDashGap={1.8}
        arcDashInitialGap={1}
        arcDashAnimateTime={ARC_LEG_MS}
        arcsTransitionDuration={400}
        htmlElementsData={htmlElements}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.02}
        htmlElement={(d: object) => {
          const wrap = document.createElement("div");
          wrap.innerHTML = (d as { html: string }).html;
          return wrap.firstElementChild as HTMLElement;
        }}
      />
    </div>
  );
}
