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
 * Google Ads "Warenkorb" / Begin Checkout – fired when a user clicks
 * a booking CTA and starts the checkout/booking flow.
 */
export function trackAddToCart(
  label: string = "Jetzt buchen",
  value?: number,
  extra: Record<string, unknown> = {}
) {
  if (!isGtagReady()) return;

  window.gtag("event", "warenkorb", {
    send_to: GA_MEASUREMENT_ID,
    event_category: "booking",
    event_label: label,
    value: value ?? 1,
    currency: "CHF",
    ...extra,
  });
}

/**
 * Custom booking event – should be fired when a booking is successfully
 * completed (e.g. on the external booking success page or server-side).
 */
export function trackBooking(
  label: string = "Buchung abgeschlossen",
  value?: number,
  extra: Record<string, unknown> = {}
) {
  if (!isGtagReady()) return;

  window.gtag("event", "buchung", {
    send_to: GA_MEASUREMENT_ID,
    event_category: "booking",
    event_label: label,
    value: value ?? 1,
    currency: "CHF",
    ...extra,
  });
}

/**
 * Google Ads purchase conversion action – fired when payment/registration
 * is successfully completed.
 */
export function trackPurchase(
  label: string = "Kauf",
  value?: number,
  extra: Record<string, unknown> = {}
) {
  if (!isGtagReady()) return;

  window.gtag("event", "ads_conversion_Kauf_1", {
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
 * Fires both the generic conversion and the "warenkorb" event.
 */
export function trackBookingClick(
  label: string = "Jetzt buchen",
  value?: number
) {
  trackConversion(label, value);
  trackAddToCart(label, value);
}

/**
 * Convenience helper for a completed booking.
 * Fires both the custom "buchung" and the Google Ads "ads_conversion_Kauf_1" event.
 */
export function trackBookingComplete(
  label: string = "Buchung abgeschlossen",
  value?: number
) {
  trackBooking(label, value);
  trackPurchase(label, value);
}
