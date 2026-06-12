import { Link } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { tenantConfig } from "@/config/tenant";

const team = [
  {
    name: "Jamal Ettana",
    role: "Geschäftsführer",
    qualification: "Staatlich geprüfter Fahrlehrer für Auto und Motorrad",
    hobbies: "Motorrad fahren, reisen, essen",
    character: "freundlich, hilfsbereit, geduldig, zuverlässig und unkompliziert",
    motto: "Gemeinsam (Fahrlehrer und Fahrschüler) sind wir stark und schaffen alles!",
    phone: "078 974 44 74",
  },
  {
    name: "Rebecca Rüegg",
    role: "Auto-Fahrlehrerin",
    qualification: "Autofahrlehrerin mit eidg. Fachausweis",
    hobbies: "Freunde und Familie treffen, Natur geniessen, Fitness",
    character: "geduldig, freundlich, ehrlich und zwischendurch mal über sich selbst am schmunzeln",
    motto: "Dein Ziel ist mein Ziel: die Führerprüfung bestehen – unkompliziert, effizient und mit einer Prise Humor.",
    phone: "078 851 48 58",
  },
];

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-heading font-bold text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
        </div>
      </nav>

      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-3">
            Erfolgreich durch Zusammenarbeit
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Zusammenarbeit führt zum Erfolg
          </h1>
          <p className="text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            Unser engagiertes Team erfahrener Fahrlehrer begleitet dich auf jedem Schritt deines Weges.
            Mit Fachwissen, Geduld und Leidenschaft fürs Unterrichten sorgen wir dafür, dass du das nötige
            Selbstvertrauen und die Fähigkeiten erlangst, um sicher und erfolgreich zu fahren.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Lerne unser Team kennen</p>
          <h2 className="text-3xl font-heading font-bold text-foreground">Das {tenantConfig.brand.name} Team</h2>
          <p className="text-muted-foreground font-body mt-2 max-w-2xl mx-auto">
            Erfahren, engagiert und unterstützend – fachkundige Anleitung und individuelles Training in einem unterstützenden Lernumfeld.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((m) => (
            <article key={m.name} className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
              <h3 className="text-2xl font-heading font-bold text-foreground">{m.name}</h3>
              <p className="text-primary font-heading font-bold uppercase tracking-wide text-xs mt-1 mb-4">{m.role}</p>
              <p className="text-sm text-muted-foreground font-body mb-4">{m.qualification}</p>

              <dl className="space-y-3 text-sm font-body">
                <div>
                  <dt className="font-heading font-bold text-foreground">Hobbys</dt>
                  <dd className="text-muted-foreground">{m.hobbies}</dd>
                </div>
                <div>
                  <dt className="font-heading font-bold text-foreground">Charakter</dt>
                  <dd className="text-muted-foreground">{m.character}</dd>
                </div>
                <div>
                  <dt className="font-heading font-bold text-foreground">Motto</dt>
                  <dd className="text-muted-foreground italic">«{m.motto}»</dd>
                </div>
              </dl>

              <a
                href={`tel:${m.phone.replace(/\s/g, "")}`}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-heading font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
                style={{ borderRadius: "3px" }}
              >
                <Phone className="w-4 h-4" /> {m.phone}
              </a>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t-2 border-primary bg-card py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-muted-foreground font-body space-y-2">
          <div className="space-x-3">
            <Link to="/impressum" className="hover:text-primary">Impressum</Link>
            <span>·</span>
            <Link to="/datenschutz" className="hover:text-primary">Datenschutz</Link>
            <span>·</span>
            <Link to="/agb" className="hover:text-primary">AGB</Link>
            <span>·</span>
            <Link to="/team" className="hover:text-primary">Team</Link>
          </div>
          <div>{tenantConfig.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
};

export default Team;
