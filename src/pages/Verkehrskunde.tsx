import PartnerKursPage from "@/components/PartnerKursPage";
import { PARTNER_NOTHILFE_URL, PARTNER_VKU_URL } from "@/lib/booking-links";

const Verkehrskunde = () => (
  <PartnerKursPage
    path="/verkehrskunde-wettingen/"
    seoTitle="VKU Wettingen & Baden | Fahrschule me"
    seoDescription="Verkehrskundeunterricht (VKU) für den Autoführerschein: 8 Stunden, Inhalte, Kosten und Anmeldung bei unserer Partner-Fahrschule Star."
    badge="Verkehrskundeunterricht"
    h1="Verkehrskundeunterricht (VKU) in"
    h1Accent="Wettingen & Baden"
    intro="Der Verkehrskundeunterricht bereitet dich auf das Verhalten im Strassenverkehr vor, bevor du hinter das Steuer steigst. Hier siehst du Inhalt, Dauer und Kosten. Den Kurs führt unsere Partner-Fahrschule Star durch, die Fahrstunden machst du bei uns."
    facts={[
      { label: "Dauer", value: "8 Stunden" },
      { label: "Kosten", value: "CHF 140" },
      { label: "Kurs", value: "Bei Partner Star" },
    ]}
    sections={[
      {
        heading: "Was ist der Verkehrskundeunterricht?",
        body: [
          "Der VKU ist ein obligatorischer Kurs für den Autoführerschein. Er findet in der Gruppe statt und umfasst acht Stunden. Du erhältst eine Teilnahmebestätigung, die du für die Zulassung zur praktischen Prüfung brauchst.",
          "Ob du den VKU auch für eine andere Kategorie brauchst, klärt das Strassenverkehrsamt. Für den Autoführerschein (Kategorie B) planst du ihn fest ein.",
        ],
      },
      {
        heading: "Das lernst du im Kurs",
        body: [
          "Im Unterricht geht es weniger um Regeln auswendig lernen als um Einstellungen und Entscheidungen im Verkehr. Du sprichst über Risiken und Ablenkung, Müdigkeit, Alkohol und Drogen am Steuer, angepasste Geschwindigkeit und Rücksicht auf schwächere Verkehrsteilnehmende.",
          "Du arbeitest mit Beispielen aus dem Alltag und tauschst dich mit anderen Fahrschülerinnen und Fahrschülern aus. So lernst du, wie du in schwierigen Situationen ruhig und vorausschauend handelst.",
        ],
      },
      {
        heading: "So meldest du dich an",
        body: [
          "Wir führen den VKU nicht selbst durch. Du buchst ihn bei unserer Partner-Fahrschule Star. Dort siehst du die Termine, den aktuellen Preis und den Kursort und meldest dich direkt an.",
          "Im neuen Ablauf ab dem 1. Januar 2027 gehört der VKU zur Vorbereitung. Zusammen mit Foto, Sehtest und Nothelferkurs kannst du ihn in beliebiger Reihenfolge erledigen.",
        ],
      },
      {
        heading: "Wie es danach weitergeht",
        body: [
          "Nach Theorieprüfung und Lernfahrausweis beginnen die Fahrstunden. Bei uns lernst du Schritt für Schritt: Ortsverkehr, Kreisel, Überland, Autobahn und die Manöver der Prüfung. Wir treffen uns am Bahnhof Wettingen.",
        ],
      },
    ]}
    faqs={[
      { q: "Wie lange dauert der VKU?", a: "Der Verkehrskundeunterricht umfasst acht Stunden. Je nach Anbieter verteilt er sich auf mehrere Termine." },
      { q: "Was kostet der VKU?", a: "Bei unserer Partner-Fahrschule Star kostet der VKU CHF 140 (Stand November 2026). Allfällige weitere Gebühren und den aktuellen Preis siehst du direkt bei der Anmeldung." },
      { q: "Ist der VKU Pflicht?", a: "Für den Autoführerschein (Kategorie B) ist der VKU obligatorisch. Für andere Kategorien klärt das Strassenverkehrsamt, ob du ihn brauchst." },
      { q: "Bietet Fahrschule me den VKU selbst an?", a: "Nein. Wir vermitteln dich an unsere Partner-Fahrschule Star. Die Fahrstunden und die praktische Ausbildung machst du bei uns." },
      { q: "Wann sollte ich den VKU machen?", a: "Plane ihn früh ein, damit die Bestätigung rechtzeitig für die praktische Prüfung vorliegt. Im neuen Ablauf ab 2027 gehört er zur Vorbereitung und kann in beliebiger Reihenfolge mit Foto, Sehtest und Nothelferkurs erledigt werden." },
    ]}
    partnerUrl={PARTNER_VKU_URL}
    partnerLabel="VKU buchen"
    breadcrumbLabel="Verkehrskundeunterricht"
    related={[
      { to: PARTNER_NOTHILFE_URL, title: "Nothelferkurs buchen", desc: "Der Kurs für den Lernfahrausweis, bei unserer Partner-Fahrschule Star." },
      { to: "/nothelferkurs-wettingen/", title: "Nothelferkurs", desc: "Inhalt, Dauer und Anmeldung zum Nothelferkurs im Überblick." },
      { to: "/autofuehrerschein-wettingen/", title: "Autoführerschein in Wettingen", desc: "Ablauf, Fahrstunden, Abos und Kosten für die Kategorie B." },
      { to: "/kosten-fuehrerschein-aargau/", title: "Kosten Führerschein Aargau", desc: "Alle Gebühren und Preise vom Sehtest bis zum Führerausweis auf Probe." },
    ]}
  />
);

export default Verkehrskunde;
