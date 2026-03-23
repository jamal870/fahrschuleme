import { Bike, Shield, Users, Clock, MapPin, Phone, Mail, CreditCard, Eye, Wrench, Target } from "lucide-react";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-background" />
        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-[Outfit] text-foreground">Drive me</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">Fahrschule</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#grundkurs" className="hover:text-primary transition-colors">Grundkurs</a>
            <a href="#sicherheit" className="hover:text-primary transition-colors">Sicherheit</a>
            <a href="#kategorien" className="hover:text-primary transition-colors">Kategorien</a>
            <a href="#kontakt" className="hover:text-primary transition-colors">Kontakt</a>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Bike className="w-3.5 h-3.5" />
              Grundkurse &amp; Fahrprüfung
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-[Outfit] text-foreground leading-tight mb-6">
              Motorradprüfung sicher bestehen –{" "}
              <span className="text-primary">was braucht es wirklich?</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-lg">
              Der obligatorische Motorrad-Grundkurs bildet die gesetzliche Grundlage. Doch erst gezielte und individuell abgestimmte Fahrstunden machen dich wirklich prüfungsfit.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg">
              <strong className="text-foreground">Unser Ziel:</strong> Nicht nur bestehen – sondern sicher fahren.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#grundkurs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <CalendarIcon className="w-4 h-4" />
                Jetzt Grundkurs buchen
              </a>
              <a
                href="#kontakt"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity border border-border"
              >
                Fahrstunden sichern
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "12-Stunden Grundkurs", desc: "Obligatorischer MGK in 4 Teilen gemäss Schweizer Vorschriften" },
            { icon: Users, title: "Individuelle Betreuung", desc: "Max. 15 Fahrschüler pro Fahrlehrer für optimalen Lernerfolg" },
            { icon: Clock, title: "Flexible Termine", desc: "Samstag & Mittwoch – passend zu deinem Alltag" },
          ].map((f, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
              <f.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold font-[Outfit] text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sicherheit */}
      <section id="sicherheit" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">Sicheres Fahren Zuerst</p>
          <h2 className="text-3xl md:text-4xl font-bold font-[Outfit] text-foreground mb-4">
            Das wichtigste ist das Erlernen einer absolut sicheren Fahrpraxis
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bei Drive Me in Wettingen liegt unser Fokus darauf, dich durch Motorrad Fahrstunden und den 12-Stunden-Grundkurs zu einem sicheren und kompetenten Fahrer auszubilden.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: "Sichere Schutzausrüstung", desc: "Helm, Protektoren, Handschuhe und Stiefel für maximalen Schutz" },
            { icon: Wrench, title: "Technisch einwandfreies Motorrad", desc: "Nur geprüfte Fahrzeuge mit ausreichendem Reifenprofil" },
            { icon: Eye, title: "Sicheres Fahren", desc: "Blicktechnik, Kurventechnik und ruhiges Fahrverhalten im Verkehr" },
            { icon: Target, title: "Kooperatives Fahren", desc: "Verantwortungsvolles und umweltbewusstes Verhalten im Strassenverkehr" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-colors">
              <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold font-[Outfit] text-foreground mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Active / Passive Safety */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { title: "Passive Sicherheit", desc: "Technisch einwandfreies Motorrad, ausreichendes Reifenprofil und vollständige Schutzausrüstung mit Protektoren, Handschuhen, Stiefeln und geprüftem Helm." },
            { title: "Aktive Sicherheit", desc: "Entsteht durch deine Fahrtechnik, präzise Fahrzeugbeherrschung und die in unseren Grundkursen sowie Fahrstunden vermittelten Fähigkeiten." },
            { title: "Training", desc: "Diese Fahrtechniken trainieren wir im gesetzlich vorgeschriebenen 12-Stunden-Grundkurs und in individuell abgestimmten Motorrad Fahrstunden." },
          ].map((item, i) => (
            <div key={i} className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="font-semibold font-[Outfit] text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategorien */}
      <section id="kategorien" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">Wählen Sie Ihre Kategorie</p>
          <h2 className="text-3xl font-bold font-[Outfit] text-foreground mb-4">Motorrad-Kategorie A1 oder A</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              title: "Kategorie A1",
              age: "Ab 15 Jahren (50ccm) / Ab 16 Jahren (125ccm)",
              items: ["Nothelferkurs absolvieren", "Verkehrskunde (Für Inhaber Kat B nicht nötig)", "Grundkurs 12 Stunden", "Praktische Prüfung: Ja"],
            },
            {
              title: "Kategorie A (35kW)",
              age: "Ab 18 Jahren",
              items: ["Nothelferkurs absolvieren", "Verkehrskunde (Für Inhaber Kat B nicht nötig)", "Grundkurs 12 Stunden", "Praktische Prüfung: Ja"],
            },
          ].map((cat, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
              <h3 className="font-bold font-[Outfit] text-foreground text-xl mb-1">{cat.title}</h3>
              <p className="text-primary text-sm font-medium mb-4">{cat.age}</p>
              <ul className="space-y-2">
                {cat.items.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-2xl mx-auto">
          Der Direkteinstieg in die unbeschränkte Kat. A ist nur noch ausnahmsweise möglich (z.B. Motorradmechaniker, Polizisten, Verkehrsexperten).
        </p>
      </section>

      {/* Grundkurs / Kurse */}
      <section id="grundkurs" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold font-[Outfit] text-foreground mb-2">Motorrad Grundkurse</h2>
        <p className="text-muted-foreground mb-4">Die Kursteile müssen in der richtigen Reihenfolge absolviert werden. Es darf nur 1 Grundkurs pro Tag besucht werden.</p>
        
        {/* Sommer-Aktion Banner */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">🏍️☀️</span>
          <p className="text-sm font-medium text-foreground">
            <strong>Sommer-Aktion:</strong> Motorrad-Grundkurs nur <span className="text-accent font-bold">CHF 130.–</span> statt <span className="line-through text-muted-foreground">CHF 160.–</span>!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((part) => (
            <div key={part} className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4 font-[Outfit]">
                {part}
              </div>
              <h3 className="font-semibold font-[Outfit] text-foreground mb-1">Grundkurs {part}</h3>
              <p className="text-sm text-muted-foreground mb-3">4 Stunden Praxis</p>
              <p className="text-lg font-bold text-primary">CHF 160.00</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-primary/5 rounded-2xl p-6 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">💡 Tipp:</strong> Nutze unseren Chatbot unten rechts, um verfügbare Termine zu sehen und direkt zu buchen!
          </p>
        </div>
      </section>

      {/* Fahrstunden */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
          <h2 className="text-2xl font-bold font-[Outfit] text-foreground mb-4">Motorrad Fahrstunden</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Ob Vorschulung, Grundschulung, Hauptschulung oder Perfektionsschulung – Schritt für Schritt lernst du in individuellen Fahrstunden alles, was du benötigst. Jeder Fahrlehrer betreut maximal 15 Fahrschüler.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: CreditCard, title: "Ratenzahlung möglich", desc: "In Zusammenarbeit mit Crowd4cash – flexible Finanzierung für deinen Motorrad-Führerschein." },
              { icon: Bike, title: "Kein eigenes Motorrad?", desc: "Kein Problem! Wir helfen dir, ein geeignetes Motorrad für die Fahrschule zu mieten." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="kontakt" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
          <h2 className="text-2xl font-bold font-[Outfit] text-foreground mb-6">Kontakt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Standort", value: "Wettingen, AG" },
              { icon: Phone, label: "Telefon", value: "Kontaktiere uns" },
              { icon: Mail, label: "E-Mail", value: "info@drive-me.ch" },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <c.icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="font-medium text-foreground text-sm">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground">
          © 2026 Drive me Fahrschule. Alle Rechte vorbehalten.
        </div>
      </footer>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};

function CalendarIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}

export default Index;
