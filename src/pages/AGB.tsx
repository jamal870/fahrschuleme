import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/useSiteContent";

const AGB = () => {
  const { content } = useSiteContent();
  const l = content.legal;
  const b = content.brand;

  const sections = [
    { title: "1. Geltungsbereich", body: `Diese AGB gelten für alle Dienstleistungen der ${b.name}: Fahrstunden (Auto & Motorrad), VKU (Verkehrskundeunterricht), NHK (Nothilfekurs) sowie alle weiteren Ausbildungsangebote.` },
    { title: "2. Anmeldung & Verbindlichkeit", body: "Buchungen über unsere Website oder telefonisch sind verbindlich. Mit der Buchung akzeptierst du diese AGB vollumfänglich." },
    { title: "3. Preise & Zahlung", body: `Alle Preise in Schweizer Franken (CHF) inkl. MwSt. Zahlung per Bar, Banküberweisung oder online. Bei Zahlungsverzug wird eine Bearbeitungsgebühr von CHF ${l.processingFeeChf} sowie ein Verzugszins von ${l.latePaymentInterestPct}% verrechnet.` },
    { title: "4. Absagen & Stornierungen", body: `Absagen müssen mindestens ${l.cancellationNoticeHours} Stunden vor dem Termin mitgeteilt werden (telefonisch oder per E-Mail). Bei kurzfristiger Absage oder Nichterscheinen wird die Lektion vollständig in Rechnung gestellt. Ausnahme: Arztzeugnis, innerhalb von ${l.medicalCertificateDays} Tagen einzureichen.` },
    { title: "5. Versicherung", body: "Das Fahrschulfahrzeug ist vollständig versichert (Haftpflicht & Vollkasko ohne Selbstbehalt). Bei grober Fahrlässigkeit des Fahrschülers kann die Versicherung ihre Leistungen kürzen." },
    { title: "6. Fahrausweis & Fahrfähigkeit", body: "Der Fahrschüler versichert, im Besitz eines gültigen Lernfahrausweises zu sein. Bei Verdacht auf Fahruntüchtigkeit (Alkohol, Drogen, Medikamente, Übermüdung) kann die Lektion ohne Rückerstattung abgebrochen werden." },
    { title: "7. Prüfungsanmeldung", body: `Die Anmeldung zur Führerprüfung erfolgt durch die ${b.name} in Absprache mit dem Fahrschüler, sobald Prüfungsreife erreicht ist.` },
    { title: "8. Verhaltensregeln", body: `Die ${b.name} behält sich das Recht vor, Fahrschüler bei Verstoss gegen die Verhaltensregeln ohne Rückerstattung von der Ausbildung auszuschliessen.` },
    { title: "9. Anwendbares Recht", body: `Es gilt Schweizer Recht. Gerichtsstand: ${l.jurisdiction}.` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`AGB – Allgemeine Geschäftsbedingungen | ${b.name}`} description={`Allgemeine Geschäftsbedingungen der ${b.name}.`} path="/agb" />
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading font-bold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12 font-body text-foreground">
        <h1 className="text-4xl font-heading font-bold mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-primary font-heading font-bold uppercase tracking-wide text-sm mb-8">{b.name} • Stand: {l.standDate}</p>

        {sections.map((s) => (
          <section key={s.title} className="mb-6">
            <h2 className="text-xl font-heading font-bold mb-3">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}

        <footer className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground space-x-2">
          <Link to="/impressum" className="hover:text-primary">Impressum</Link>
          <span>·</span>
          <Link to="/datenschutz" className="hover:text-primary">Datenschutz</Link>
          <span>·</span>
          <Link to="/agb" className="hover:text-primary">AGB</Link>
        </footer>
      </main>
    </div>
  );
};

export default AGB;
