import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/useSiteContent";

const Datenschutz = () => {
  const { content } = useSiteContent();
  const c = content.contact;
  const b = content.brand;
  const l = content.legal;

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`Datenschutzerklärung – ${b.name}`} description={`Datenschutzerklärung der ${b.name} gemäss Schweizer Datenschutzgesetz (DSG).`} path="/datenschutz" />
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading font-bold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12 font-body text-foreground">
        <h1 className="text-4xl font-heading font-bold mb-2">Datenschutzerklärung</h1>
        <p className="text-primary font-heading font-bold uppercase tracking-wide text-sm mb-8">{b.name}</p>

        <section className="space-y-2 mb-8">
          <p className="font-semibold">Verantwortliche Stelle:</p>
          <p>{b.name}</p>
          <p>{c.address.detail}, {c.address.city}</p>
          <p>E-Mail: <a className="text-primary hover:underline" href={`mailto:${c.email}`}>{c.email}</a></p>
          <p>Inhaber: {l.ownerName}</p>
        </section>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Gestützt auf Art. 13 der Schweizerischen Bundesverfassung und das Datenschutzgesetz (DSG) hat jede Person Anspruch
          auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">1. Erhebung von Daten</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wir erheben personenbezogene Daten (Name, E-Mail, Telefon) nur, wenn du uns diese freiwillig über das Kontaktformular,
            per E-Mail oder telefonisch mitteilst. Diese Daten verwenden wir ausschliesslich zur Bearbeitung deiner Anfrage und
            zur Abwicklung der Fahrausbildung.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">2. Datenweitergabe</h2>
          <p className="text-muted-foreground leading-relaxed">
            Deine Daten werden nicht an Dritte weitergegeben, es sei denn, dies ist für die Durchführung der Ausbildung notwendig
            (z.B. Anmeldung zur Führerprüfung beim Strassenverkehrsamt Kanton Aargau).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">3. Cookies & Google Maps</h2>
          <p className="text-muted-foreground leading-relaxed">
            Unsere Website verwendet technisch notwendige Cookies sowie den Kartendienst Google Maps (Google Ireland Limited).
            Durch die Nutzung von Google Maps können Daten an Google übermittelt werden. Weitere Informationen: google.com/privacy
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">4. Datensicherheit</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wir setzen technische und organisatorische Massnahmen ein, um deine Daten vor unberechtigtem Zugriff zu schützen.
            Die Datenübertragung erfolgt verschlüsselt via SSL/TLS.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">5. Deine Rechte</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">Du hast jederzeit das Recht auf:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Auskunft über deine gespeicherten Daten</li>
            <li>Berichtigung unrichtiger Daten</li>
            <li>Löschung deiner Daten</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Für Anfragen: <a className="text-primary hover:underline" href={`mailto:${c.email}`}>{c.email}</a>
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-heading font-bold mb-3">6. Rechtsgrundlage</h2>
          <p className="text-muted-foreground leading-relaxed">
            Schweizerisches Datenschutzgesetz (DSG). Gerichtsstand: {l.jurisdiction}.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">Stand: {l.standDate}</p>

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

export default Datenschutz;
