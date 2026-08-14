// Erkennt doppelt erfasste Kurstermine (gleicher Teil, Datum und Startzeit)
// und behält pro Slot nur einen Eintrag – so kann niemand denselben Kurs
// versehentlich zweimal buchen.

export interface DedupeCourse {
  id: string;
  part?: number | null;
  date: string;
  time: string;
  spotsAvailable?: number | null;
  spots_available?: number | null;
}

const startTime = (time: string) => (time || "").split(/[–\-]/)[0].trim();

export const courseSlotKey = (c: DedupeCourse, part?: number) =>
  `${c.part ?? part ?? ""}|${(c.date || "").trim()}|${startTime(c.time)}`;

const spotsOf = (c: DedupeCourse) =>
  Number(c.spotsAvailable ?? c.spots_available ?? 0);

/**
 * Entfernt Duplikate. Bei gleichem Slot gewinnt der Eintrag mit den wenigsten
 * freien Plätzen (dort hängen die bereits vorhandenen Buchungen dran).
 */
export function dedupeCourses<T extends DedupeCourse>(list: T[], part?: number): T[] {
  const best = new Map<string, T>();
  for (const c of list) {
    const key = courseSlotKey(c, part);
    const cur = best.get(key);
    if (!cur || spotsOf(c) < spotsOf(cur)) best.set(key, c);
  }
  return list.filter((c) => best.get(courseSlotKey(c, part)) === c);
}
