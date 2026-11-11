// Auswahl der Google-Bewertungen für die Website.
// Nur 5-Sterne-Bewertungen werden angezeigt. Bevorzugt werden Stimmen, die
// Jamal als Fahrlehrer oder die Motorrad-Ausbildung ansprechen. Gibt es davon
// keine, werden die übrigen 5-Sterne-Bewertungen gezeigt.
// Die Gesamtbewertung (Schnitt und Anzahl) bleibt unverändert die echte von Google.

export interface ReviewLike {
  rating: number;
  text: string;
}

const RELEVANT = /jamal|motorrad|töff|toeff|\bmgk\b|grundkurs|\ba1\b|\ba2\b|\ba35\b|fahrlehrer|instruktor|instructor/i;

export const isRelevantReview = (r: ReviewLike): boolean => RELEVANT.test(r.text ?? "");

export function selectReviews<T extends ReviewLike>(reviews: T[], max = 6): T[] {
  const fiveStar = reviews.filter((r) => r.rating === 5 && (r.text ?? "").trim().length > 0);
  const relevant = fiveStar.filter(isRelevantReview);
  return (relevant.length > 0 ? relevant : fiveStar).slice(0, max);
}
