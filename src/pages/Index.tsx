import { Bike, Shield, Users, Clock, MapPin, Phone, Mail } from "lucide-react";
import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <nav className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-[Outfit] text-foreground">Drive me</span>
            <span className="text-xs text-muted-foreground font-medium mt-1">Fahrschule</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#kurse" className="hover:text-primary transition-colors">Kurse</a>
            <a href="#about" className="hover:text-primary transition-colors">Über uns</a>
            <a href="#kontakt" className="hover:text-primary transition-colors">Kontakt</a>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Bike className="w-3.5 h-3.5" />
              Motorrad Grundkurse
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-[Outfit] text-foreground leading-tight mb-6">
              Dein Weg zum{" "}
              <span className="text-primary">Motorrad&shy;führerschein</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Obligatorische Grundkurse in 4 Teilen – professionell, flexibel und praxisnah in Wettingen. Starte jetzt dein Abenteuer auf zwei Rädern!
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#kurse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Calendar className="w-4 h-4" />
                Kurstermine ansehen
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "Obligatorischer Kurs", desc: "Anerkannter MGK gemäss Schweizer Vorschriften" },
            { icon: Users, title: "Kleine Gruppen", desc: "Individuelle Betreuung für maximalen Lernerfolg" },
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

      {/* Kurse */}
      <section id="kurse" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold font-[Outfit] text-foreground mb-2">Motorrad Grundkurse</h2>
        <p className="text-muted-foreground mb-10">Die Kursteile müssen in der richtigen Reihenfolge absolviert werden.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((part) => (
            <div key={part} className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4 font-[Outfit]">
                {part}
              </div>
              <h3 className="font-semibold font-[Outfit] text-foreground mb-1">Teil {part}</h3>
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

function Calendar(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    </svg>
  );
}

export default Index;
