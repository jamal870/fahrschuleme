const DEFAULT_TEXT = "Hallo Fahrschule me, ich habe eine Frage.";

/**
 * Baut aus einer WhatsApp-Adresse (wa.me/<Nummer> oder ...?phone=<Nummer>) den
 * offiziell dokumentierten Link https://api.whatsapp.com/send?phone=...&text=...
 * Er öffnet denselben Chat wie wa.me, wird aber nicht als Weiterleitung gewertet.
 * Auch Werte, die im Admin gespeichert sind (z. B. noch mit wa.me), werden so umgestellt.
 */
export function whatsappLink(url: string | undefined, text: string = DEFAULT_TEXT): string {
  if (!url) return "";
  const match = url.match(/(?:wa\.me\/|phone=)\+?(\d{6,15})/);
  if (!match) return url;
  return `https://api.whatsapp.com/send?phone=${match[1]}&text=${encodeURIComponent(text)}`;
}
