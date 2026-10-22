import RelatedLinks from "@/components/RelatedLinks";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBot from "@/components/ChatBot";
import Seo from "@/components/Seo";
import { tenantConfig } from "@/config/tenant";
import { Link } from "react-router-dom";
import grundkurs1 from "@/assets/grundkurs-1.png";
import grundkurs2 from "@/assets/grundkurs-2.png";
import grundkurs3 from "@/assets/grundkurs-3.png";

const images = [grundkurs1, grundkurs2, grundkurs3];

const Motorrad = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Motorrad Führerschein Wettingen – A1, A2, A | Fahrschule me"
      description="Motorrad-Ausbildung in Wettingen: Grundkurs (MGK), Vorprüfungsfahrt, individuelle Fahrstunden für Kategorien A1, A2 und A. Jetzt informieren."
      path="/motorrad/"
    />
    <SiteHeader />
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Motorrad</p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">Motorradführerschein <span className="text-primary">in {tenantConfig.location.city}</span></h1>
        <p className="text-muted-foreground font-body max-w-2xl">
          Alle Kategorien (AM, A1, A2, A) – Grundkurs, Fahrstunden und Prüfungsvorbereitung aus einer Hand.
        </p>
      </div>
    </header>

      <section className="bg-card py-10">
        <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-4">
          <h2 className="text-2xl font-heading font-bold text-foreground">Dein Weg zum Motorradführerschein</h2>
          <p>Der Motorradführerschein umfasst mehr als das sichere Bedienen der Maschine. Zum Lernen gehören auch Blickführung, Bremsen, Kurvenfahren und das Einschätzen von Verkehrssituationen.</p>
          <p>Auf dieser Seite findest du einen Einstieg in die Motorrad-Ausbildung in Wettingen und die dazugehörigen Grundkurse. Welche Ausbildung zu dir passt, hängt unter anderem von deinem bisherigen Führerausweis und der gewünschten Kategorie ab.</p>
          <p>Informiere dich vor der Buchung über die Voraussetzungen deiner Kategorie. Wenn du bereits Erfahrung mitbringst oder unsicher bist, welche Kursteile du benötigst, kläre dies zuerst mit der Fahrschule.</p>
          <p>Für zusätzliche Übung kannst du dich über individuelle Motorrad-Fahrstunden informieren. Aktuelle Kursangebote und die Buchungsmöglichkeiten erreichst du über die verlinkten Grundkursseiten.</p>
        </div>
      </section>

    <section className="bg-section-alt py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Kategorien</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tenantConfig.categories.map((cat, i) => (
            <Link key={i} to="/grundkurs/" className="bg-card border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all block" style={{ borderRadius: "3px" }}>
              <h3 className="font-heading font-bold text-foreground text-lg mb-1">{cat.title}</h3>
              <p className="text-primary text-xs font-heading font-bold mb-2">{cat.age}</p>
              <p className="text-xs text-muted-foreground font-body">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-card py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Motorrad-Grundkurs in Wettingen</h2>
        <div className="max-w-3xl text-muted-foreground font-body space-y-4 mb-8">
          <p>Der Motorrad-Grundkurs in Wettingen ist auf dieser Seite in drei Teile mit jeweils vier Stunden Praxis gegliedert. Die Übersicht hilft dir, die Kursteile zu finden und von hier zur Anmeldung zu wechseln.</p>
          <p>Welche Kursteile du benötigst, hängt von deiner gewünschten Kategorie und deinem bisherigen Führerausweis ab. Kläre offene Fragen vor der Anmeldung mit der Fahrschule. Bei der Buchung wählst du die passenden Termine aus und absolvierst die benötigten Kursteile in der richtigen Reihenfolge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((part) => (
            <Link key={part} to="/grundkurs/" className="bg-section-alt border border-border p-6 text-center hover:border-primary/50 hover:shadow-md transition-all block" style={{ borderRadius: "3px" }}>
              <img src={images[part - 1]} alt={`Grundkurs ${part}`} className="w-32 h-32 mx-auto mb-3 object-contain" loading="lazy" />
              <div className="w-10 h-10 mx-auto mb-3 bg-primary/10 text-primary font-heading font-bold flex items-center justify-center" style={{ borderRadius: "3px" }}>{part}</div>
              <h3 className="font-heading font-bold text-foreground mb-1">Grundkurs {part}</h3>
              <p className="text-sm text-muted-foreground font-body mb-3">4 Stunden Praxis</p>
              <p className="text-lg font-heading font-bold text-primary">CHF 160.00</p>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/kurstermine/" className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm hover:bg-primary/10 transition-colors">
            Grundkurs-Termine in Wettingen ansehen
          </Link>
          <Link to="/grundkurs/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm hover:opacity-90 transition-opacity">
            Motorrad-Grundkurs buchen
          </Link>
        </div>
      </div>
    </section>

    <div className="max-w-6xl mx-auto px-6 py-10">
      <RelatedLinks links={[
        { to: "/motorrad-fuehrerschein-baden/", title: "Motorradführerschein für Baden", desc: "Ausbildung, Grundkurs und Fahrstunden für Motorradfahrer aus Baden." },
      ]} />
    </div>

    <section className="bg-card py-10">
      <div className="max-w-5xl mx-auto px-6 font-body text-muted-foreground space-y-3">
        <h2 className="text-2xl font-heading font-bold text-foreground">Grundkurs und zusätzliche Fahrstunden</h2>
        <p>Die Grundkursübersicht zeigt drei Teile mit jeweils vier Stunden Praxis. Daneben bietet die Fahrschule individuelle Motorrad-Fahrstunden, Vorschulung und Vor-Prüfungsfahrten an. Diese Angebote erfüllen unterschiedliche Aufgaben: Der Grundkurs ist als Kurs gegliedert, während du dich für zusätzliche Fahrpraxis über Fahrstunden informieren kannst.</p>
      </div>
    </section>

    <SiteFooter />
    <ChatBot />
  </div>
);

export default Motorrad;
