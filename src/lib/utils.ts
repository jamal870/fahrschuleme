import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Wochentag (de) aus "TT.MM.JJJJ" berechnen; Fallback wenn Format unbekannt. */
export function dayNameFromDateStr(s?: string | null, fallback?: string | null): string {
  const m = (s || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return fallback ?? "";
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][d.getDay()];
}
