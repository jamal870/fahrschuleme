import { describe, expect, it } from "vitest";
import { selectReviews } from "./review-filter";

const r = (rating: number, text: string) => ({ rating, text });

describe("selectReviews", () => {
  it("zeigt keine Bewertungen unter 5 Sternen", () => {
    const out = selectReviews([r(1, "Euch gehört die Lizenz entzogen. Jamal"), r(4, "Motorrad gut"), r(5, "Jamal ist top")]);
    expect(out).toHaveLength(1);
    expect(out[0].rating).toBe(5);
  });

  it("bevorzugt Bewertungen zu Jamal und Motorrad", () => {
    const out = selectReviews([
      r(5, "Führerschein Klasse B, rundum begeistert"),
      r(5, "Habe meinen A35 gemacht. Jamal sehr empfehlen"),
      r(5, "Motorrad-Grundkurs war super"),
    ]);
    expect(out.map((x) => x.text)).toEqual([
      "Habe meinen A35 gemacht. Jamal sehr empfehlen",
      "Motorrad-Grundkurs war super",
    ]);
  });

  it("fällt auf übrige 5-Sterne-Bewertungen zurück, wenn keine passende da ist", () => {
    const out = selectReviews([r(5, "Rundum begeistert"), r(2, "Schlecht")]);
    expect(out).toEqual([r(5, "Rundum begeistert")]);
  });

  it("liefert eine leere Liste ohne 5-Sterne-Bewertung", () => {
    expect(selectReviews([r(1, "nein"), r(3, "naja")])).toEqual([]);
  });
});
