"use client";

import dynamic from "next/dynamic";

const GlobeInner = dynamic(() => import("@/components/GlobeInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "520px",
        background: "#000008",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "#4B5563", fontSize: "14px" }}>Loading globe...</span>
    </div>
  ),
});

export default function MapWrapper() {
  return (
    <div style={{ width: "100%", background: "#000008" }}>
      <GlobeInner />
    </div>
  );
}
