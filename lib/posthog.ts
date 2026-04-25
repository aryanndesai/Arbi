// TODO: install posthog-js and replace this stub with the real client.
// import posthog from "posthog-js";

export const posthogConfig = {
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  host: "https://us.i.posthog.com",
};

export function initPosthog() {
  if (typeof window === "undefined") return;
  if (!posthogConfig.apiKey) {
    console.warn(
      "Missing PostHog env var. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local."
    );
    return;
  }
  // TODO: replace with posthog.init(posthogConfig.apiKey, { api_host: posthogConfig.host })
}
