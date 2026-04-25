// TODO: install resend and replace this stub with the real client.
// import { Resend } from "resend";

export const resendConfig = {
  apiKey: process.env.RESEND_API_KEY ?? "",
};

export function getResend() {
  if (!resendConfig.apiKey) {
    throw new Error(
      "Missing Resend env var. Set RESEND_API_KEY in .env.local."
    );
  }
  // TODO: replace with new Resend(resendConfig.apiKey)
  return { apiKey: resendConfig.apiKey };
}
