/**
 * Minimal analytics helpers for GA4 / Google Ads (gtag.js).
 * The base tag is loaded in index.html; this module only emits events.
 */

export const GA_MEASUREMENT_ID = "G-FD5JQ1V10E";

function isGtagReady(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Fire a generic conversion event. Works for GA4 immediately and can be
 * mapped to a Google Ads conversion action once an AW- label is added.
 */
export function trackConversion(
  label: string,
  value?: number,
  extra: Record<string, unknown> = {}
) {
  if (!isGtagReady()) return;

  window.gtag("event", "conversion", {
    send_to: GA_MEASUREMENT_ID,
    event_category: "booking",
    event_label: label,
    value: value ?? 1,
    currency: "CHF",
    ...extra,
  });
}

/**
 * Convenience helper for all booking-related CTAs.
 */
export function trackBookingClick(
  label: string = "Jetzt buchen",
  value?: number
) {
  trackConversion(label, value);
}
