/**
 * 1lounge base URL. NEXT_PUBLIC_BASE_LOUNGE_DOMAIN may be a bare host
 * ("1lounge.test:3000"); without a protocol we use a protocol-relative URL
 * ("//host") so it follows the current page's http/https.
 */
const LOUNGE_BASE = process.env.NEXT_PUBLIC_BASE_LOUNGE_DOMAIN?.trim().replace(/\/+$/, "");

export const LOUNGE_URL: string | null = LOUNGE_BASE
  ? /^https?:\/\//.test(LOUNGE_BASE)
    ? LOUNGE_BASE
    : `//${LOUNGE_BASE.replace(/^\/+/, "")}`
  : null;

/** 1lounge sign-in page (shared Supabase session via cookie domain). */
export const LOGIN_URL: string | null = LOUNGE_URL ? `${LOUNGE_URL}/login` : null;
