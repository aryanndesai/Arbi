// TODO: install @supabase/supabase-js and replace this stub with the real client.
// import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function getSupabase() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  // TODO: replace with createClient(supabaseConfig.url, supabaseConfig.anonKey)
  return { url: supabaseConfig.url, anonKey: supabaseConfig.anonKey };
}
