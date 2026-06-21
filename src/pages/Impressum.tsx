import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import { useSiteContent } from "@/hooks/useSiteContent";

const Impressum = () => {
  const { content } = useSiteContent();
  const c = content.contact;
  const b = content.brand;
  const l = content.legal;

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`Impressum – ${b.name}`} description={`Impressum und rechtliche Angaben der ${b.name}.`} path="/impressum" />
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading font-bold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12 font-body text-foreground">
        <h1 className="text-4xl font-heading font-bold mb-2">Impressum</h1>
        <p className="text-primary font-heading font-bold uppercase tracking-wide text-sm mb-8">{b.name} • Stand: {l.standDate}</p>

        <section className="space-y-2 mb-8">
          <p><strong>{b.name}</strong></p>
          <p>{c.address.detail}, {c.address.city}, Schweiz</p>
          <p>Telefon: <a className="text-primary hover:underline" href={`tel:${c.phone}`}>{c.phone}</a></p>
          <p>E-Mail: <a className="text-primary hover:underline" href={`mailto:${c.email}`}>{c.email}</a></p>
          <p>Inhaber & Geschäftsführer: {l.ownerName}</p>
          <p>Unternehmensform: Einzelunternehmen</p>
          <p>Handelsregistereintrag: Kanton Aargau</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-heading font-bold mb-3">Haftungsausschluss</h2>
          <p className="text-muted-foreground leading-relaxed">
            Alle Inhalte dieser Website dienen ausschliesslich zu Informationszwecken. {b.name} übernimmt keine Gewähr
            für die inhaltliche Richtigkeit, Vollständigkeit und Aktualität der Informationen und lehnt jegliche Haftung für
            Schäden ab, die aus dem Zugriff oder der Nutzung der Website entstehen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-heading font-bold mb-3">Urheberrecht</h2>
          <p className="text-muted-foreground leading-relaxed">
            Alle Inhalte, Bilder und Texte auf dieser Website sind Eigentum der {b.name} und dürfen ohne ausdrückliche
            schriftliche Genehmigung nicht verwendet, vervielfältigt oder veröffentlicht werden.
          </p>
        </section>

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

export default Impressum;
