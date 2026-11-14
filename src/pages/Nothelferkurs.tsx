import PartnerKursPage from "@/components/PartnerKursPage";
import { PARTNER_NOTHILFE_URL, PARTNER_VKU_URL } from "@/lib/booking-links";

const Nothelferkurs = () => (
  <PartnerKursPage
    path="/nothelferkurs-wettingen/"
    seoTitle="Nothelferkurs Wettingen & Baden | Fahrschule me"
    seoDescription="Nothelferkurs für den Führerschein: 10 Stunden, Kosten, Gültigkeit und Anmeldung. Wir vermitteln dich an unsere Partner-Fahrschule Star."
    badge="Nothelferkurs"
    h1="Nothelferkurs für den Führerschein in"
    h1Accent="Wettingen & Baden"
    intro="Ohne Nothelferkurs gibt es keinen Lernfahrausweis. Hier erfährst du, was dich erwartet, wie lange der Kurs gilt und wie du dich anmeldest. Den Kurs führt unsere Partner-Fahrschule Star durch, die Fahrstunden machst du bei uns."
    facts={[
      { label: "Dauer", value: "10 Stunden" },
      { label: "Kosten", value: "ca. CHF 120" },
      { label: "Gültigkeit", value: "6 Jahre" },
    ]}
    sections={[
      {
        heading: "Wofür brauchst du den Nothelferkurs?",
        body: [
          "Der Nothelferkurs gehört zu den Unterlagen, die du für den Lernfahrausweis brauchst. Du lernst, wie du an einer Unfallstelle richtig handelst, bis die Rettung eintrifft.",
          "Die Teilnahmebestätigung ist sechs Jahre gültig. Wenn du den Kurs früh machst, bleibt sie bis zu deiner Prüfung gültig, auch wenn die Ausbildung länger dauert.",
        ],
      },
      {
        heading: "Das lernst du im Kurs",
        body: [
          "Im Kurs übst du, eine Unfallstelle abzusichern, den Notruf abzusetzen und verletzte Personen zu betreuen. Dazu gehören die Lagerung, das Stillen starker Blutungen und die Herz-Lungen-Wiederbelebung.",
          "Du übst alles praktisch in der Gruppe, nicht nur am Bildschirm. Fachleute zeigen dir die Handgriffe, du probierst sie selbst aus und erhältst Rückmeldungen.",
        ],
      },
      {
        heading: "So meldest du dich an",
        body: [
          "Wir führen den Nothelferkurs nicht selbst durch. Du buchst ihn bei unserer Partner-Fahrschule Star. Dort siehst du die Termine, den aktuellen Preis und den Kursort und meldest dich direkt an.",
          "Plane den Kurs früh ein. Im neuen Ablauf ab dem 1. Januar 2027 gehört er zur Vorbereitung und kann zusammen mit Foto, Sehtest und Verkehrskundeunterricht in beliebiger Reihenfolge erledigt werden.",
        ],
      },
      {
        heading: "Wie es danach weitergeht",
        body: [
          "Mit dem Nothelferkurs, dem Sehtest und dem Passfoto stellst du das Gesuch für den Lernfahrausweis. Danach folgen die Theorieprüfung und die Fahrstunden. Bei uns startest du am Bahnhof Wettingen, dort treffen wir uns zu deinen Fahrstunden.",
        ],
      },
    ]}
    faqs={[
      { q: "Wie lange dauert der Nothelferkurs?", a: "Der Kurs dauert 10 Stunden. Je nach Anbieter ist er auf mehrere Abende oder auf einen oder zwei Tage verteilt." },
      { q: "Was kostet der Nothelferkurs?", a: "Rechne mit rund CHF 120. Der genaue Preis hängt vom Anbieter ab. Bei unserer Partner-Fahrschule Star siehst du ihn direkt bei der Anmeldung." },
      { q: "Wie lange ist die Bestätigung gültig?", a: "Die Teilnahmebestätigung ist sechs Jahre gültig." },
      { q: "Bietet Fahrschule me den Nothelferkurs selbst an?", a: "Nein. Wir vermitteln dich an unsere Partner-Fahrschule Star. Die Fahrstunden und die praktische Ausbildung machst du bei uns." },
      { q: "Muss ich den Kurs vor der Theorieprüfung machen?", a: "Der Nothelferkurs ist eine Voraussetzung für den Lernfahrausweis. Im neuen Ablauf ab 2027 erledigst du ihn zusammen mit Foto, Sehtest und Verkehrskundeunterricht in beliebiger Reihenfolge." },
    ]}
    partnerUrl={PARTNER_NOTHILFE_URL}
    partnerLabel="Nothelferkurs buchen"
    breadcrumbLabel="Nothelferkurs"
    related={[
      { to: PARTNER_VKU_URL, title: "Verkehrskundeunterricht (VKU) buchen", desc: "Der zweite Kurs im Ablauf, bei unserer Partner-Fahrschule Star." },
      { to: "/verkehrskunde-wettingen/", title: "Verkehrskundeunterricht VKU", desc: "Inhalt, Dauer und Anmeldung zum VKU im Überblick." },
      { to: "/autofuehrerschein-wettingen/", title: "Autoführerschein in Wettingen", desc: "Ablauf, Fahrstunden, Abos und Kosten für die Kategorie B." },
      { to: "/kosten-fuehrerschein-aargau/", title: "Kosten Führerschein Aargau", desc: "Alle Gebühren und Preise vom Sehtest bis zum Führerausweis auf Probe." },
    ]}
  />
);

export default Nothelferkurs;
