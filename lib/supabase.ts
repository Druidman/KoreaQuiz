import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * Browser-only Supabase client, configured like 1lounge's: the session lives in
 * cookies scoped to NEXT_PUBLIC_COOKIE_DOMAIN, so a login made on 1lounge is
 * visible here. Without a 1lounge login we fall back to anonymous auth.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Brak konfiguracji Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
        detectSessionInUrl: true,
      },
      cookieOptions: {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      },
    });
  }
  return browserClient;
}

/** Name to show for a real (non-anonymous) account, e.g. from Azure. */
export function displayName(user: User): string {
  const meta = user.user_metadata ?? {};
  return meta.full_name || meta.name || user.email || "użytkownik";
}


