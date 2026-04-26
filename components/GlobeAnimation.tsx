"use client";

import dynamic from "next/dynamic";

const GlobeAnimationInner = dynamic(() => import("./GlobeAnimationInner"), {
  ssr: false,
  loading: () => (
    <div
      className="mx-auto w-full max-w-[560px]"
      style={{ height: 440 }}
      aria-hidden
    />
  ),
});

export default function GlobeAnimation() {
  return <GlobeAnimationInner />;
}
