import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  TrendingUp,
  GraduationCap,
  Smartphone,
  Check,
  Lock,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";

const features = [
  { icon: Calendar, title: "Kalender & Termine", desc: "Woche, Tag oder Liste – mit Google Kalender Sync. Schüler können Stunden direkt online anfragen." },
  { icon: Users, title: "Schülerverwaltung", desc: "Alle Schüler auf einen Blick. Kat. A/B, Fortschritt, Prüfungsreife – alles im Griff." },
  { icon: FileText, title: "Rechnungen & Zahlungen", desc: "Rechnungen per PDF versenden, Mahnungen automatisch, Bar- oder Online-Zahlung via Stripe. CHF-optimiert." },
  { icon: TrendingUp, title: "Umsatz & Berichte", desc: "Woche, Monat, Jahr. Umsatz pro Fahrlehrer, Fahrlehrer-Abrechnung als PDF exportieren." },
  { icon: GraduationCap, title: "Prüfungsplanung", desc: "Prüfungstermine verwalten, Prüfungsreife tracken, Foto-Upload. Strassenverkehrsamt Wettingen/Baden integriert." },
  { icon: Smartphone, title: "Native iOS & Android App", desc: "Optimiert für Tablet & Smartphone. Verfügbar im Google Play Store und Apple App Store." },
];

const soloFeatures = [
  "1 Fahrlehrer",
  "Bis 5 Schüler",
  "Kalender & Termine",
  "Rechnungen & PDF",
  "Stripe Online-Zahlung",
  "Google Kalender Sync",
  "Mobile + Desktop App",
  "Buchhaltung inklusive",
  "Lohnbuchhaltung inklusive",
];
const soloPlusFeatures = [
  "1 Fahrlehrer",
  "Unbegrenzte Schüler",
  "Alle Solo Features",
  "Buchhaltung inklusive",
  "Lohnbuchhaltung inklusive",
  "Ausgaben erfassen",
  "Fahrlehrer-Abrechnung PDF",
  "Steuerexport Excel",
  "Priority Support",
];

const faqs = [
  { q: "Was passiert nach dem 30-tägigen Test?", a: "Nach Ablauf des Trials wählst du ein Abonnement (Solo CHF 449/Monat oder Solo+ CHF 690/Monat, jährliche Zahlung). Deine Daten bleiben vollständig erhalten." },
  { q: "Kann ich meine Daten exportieren?", a: "Ja, jederzeit. Unter Einstellungen → \"Meine Daten exportieren\" kannst du alle deine Daten (Schüler, Rechnungen, Termine) als Excel oder PDF herunterladen." },
  { q: "Wo werden meine Daten gespeichert?", a: "Alle Daten werden ausschliesslich auf Servern in der Schweiz gespeichert (Hostpoint AG, Rapperswil-Jona). Wir sind DSG-konform." },
  { q: "Auf welchen Geräten läuft die App?", a: "Die App ist nativ für iOS (App Store) und Android (Google Play Store) verfügbar – optimiert für Tablet und Smartphone. Zusätzlich gibt es eine Desktop-Version im Browser." },
];

const FuerFahrlehrer = () => {
  const soloPrice = 449;
  const soloPlusPrice = 690;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="fahrschule me App – Die Fahrschul-App für Schweizer Fahrlehrer"
        description="Schüler verwalten, Termine planen, Rechnungen verschicken – in einer App, die wirklich für Schweizer Fahrlehrer gemacht ist. 30 Tage gratis testen."
        path="/fuer-fahrlehrer"
      />
      <SiteHeader />

      {/* Hero */}
      <section className="bg-card relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6 text-xs font-heading font-bold uppercase tracking-wide text-primary" style={{ borderRadius: "3px" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Neu: 30 Tage gratis testen – keine Kreditkarte
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
            Weniger Verwaltung.<br />
            <span className="text-primary">Mehr Zeit auf der Strasse.</span>
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-2xl mx-auto mb-8">
            Schüler verwalten, Termine planen, Rechnungen verschicken – in einer App, die wirklich für Schweizer Fahrlehrer gemacht ist. Kein Excel. Kein Papier. Kein Stress.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <a href="#preise" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
              30 Tage gratis starten
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors" style={{ borderRadius: "3px" }}>
              Features ansehen
            </a>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Keine Kreditkarte nötig · Kündigung jederzeit · Daten in der Schweiz
          </p>

          {/* Store Badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-body opacity-70 leading-none">Jetzt im</div>
                <div className="text-sm font-heading font-bold uppercase leading-tight">Google Play</div>
              </div>
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
              <Smartphone className="w-5 h-5" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-body opacity-70 leading-none">Jetzt im</div>
                <div className="text-sm font-heading font-bold uppercase leading-tight">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { num: "iOS & Android", lbl: "Native App – Tablet & Smartphone" },
            { num: "30 Tage", lbl: "Gratis testen" },
            { num: "CHF 449", lbl: "Solo · Pro Monat (jährlich)" },
            { num: "100% CH", lbl: "Daten in der Schweiz" },
          ].map((s, i) => (
            <div key={i} className="py-2">
              <p className="text-xl md:text-2xl font-heading font-bold">{s.num}</p>
              <p className="text-xs font-body opacity-80 mt-1">{s.lbl}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-section-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Was fahrschule me kann</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Alles was ein Fahrlehrer braucht
            </h2>
            <p className="text-muted-foreground font-body max-w-xl mx-auto">
              Von der Terminplanung bis zum Steuerexport – alles, was du täglich brauchst.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-card border border-border p-6 hover:border-primary/50 hover:shadow-md transition-all" style={{ borderRadius: "3px" }}>
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4" style={{ borderRadius: "3px" }}>
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preise" className="bg-card py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Preise</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Einfach. Transparent.</h2>
            <p className="text-muted-foreground font-body mb-8">Weniger als eine halbe Fahrstunde pro Monat.</p>

            <div className="inline-flex bg-section-alt border border-border px-4 py-2" style={{ borderRadius: "3px" }}>
              <span className="text-sm font-heading font-bold uppercase tracking-wide text-primary">
                Jährliche Zahlung · inkl. Buchhaltung & Lohnbuchhaltung
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo */}
            <div className="bg-section-alt border border-border p-8" style={{ borderRadius: "3px" }}>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground mb-3">Solo</p>
              <p className="text-5xl font-heading font-bold text-foreground">
                CHF {soloPrice}
                <span className="text-lg font-body font-normal text-muted-foreground">/Monat</span>
              </p>
              <p className="text-xs text-muted-foreground font-body mb-6 mt-1">
                bei jährlicher Zahlung (CHF {soloPrice * 12}/Jahr)
              </p>
              <ul className="space-y-2 mb-6">
                {soloFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#cta" className="block text-center py-3 bg-card border border-border text-foreground font-heading font-bold uppercase text-sm tracking-wide hover:border-primary transition-colors" style={{ borderRadius: "3px" }}>
                30 Tage gratis starten
              </a>
            </div>

            {/* Solo+ */}
            <div className="bg-section-alt border-2 border-primary p-8 relative" style={{ borderRadius: "3px" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-heading font-bold uppercase tracking-wide px-3 py-1" style={{ borderRadius: "3px" }}>
                Empfohlen
              </span>
              <p className="text-xs font-heading font-bold uppercase tracking-widest text-muted-foreground mb-3">Solo+</p>
              <p className="text-5xl font-heading font-bold text-foreground">
                CHF {soloPlusPrice}
                <span className="text-lg font-body font-normal text-muted-foreground">/Monat</span>
              </p>
              <p className="text-xs text-muted-foreground font-body mb-6 mt-1">
                bei jährlicher Zahlung (CHF {soloPlusPrice * 12}/Jahr)
              </p>
              <ul className="space-y-2 mb-6">
                {soloPlusFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-body text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#cta" className="block text-center py-3 bg-primary text-primary-foreground font-heading font-bold uppercase text-sm tracking-wide hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
                30 Tage gratis starten
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground font-body mt-6">
            Keine Kreditkarte für den Trial · Kündigung jederzeit · App im Google Play Store & App Store verfügbar
          </p>

          {/* Team */}
          <div className="mt-8 bg-section-alt border border-border p-6" style={{ borderRadius: "3px" }}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-heading font-bold text-foreground text-lg">Team</h3>
              <span className="text-[10px] font-heading font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5" style={{ borderRadius: "3px" }}>Bald verfügbar</span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground mb-2">Auf Anfrage</p>
            <p className="text-sm text-muted-foreground font-body mb-3">
              Für Fahrschulen mit mehreren Fahrlehrern – zentraler Kalender, gemeinsame Rechnungsstellung und Auslastungsberichte.
            </p>
            <a href="mailto:info@fahrschule-me.ch" className="inline-flex items-center gap-1 text-sm font-heading font-bold text-primary hover:underline">
              Interesse melden →
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-foreground py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-2xl md:text-3xl font-heading font-bold text-background leading-snug mb-6">
            "Endlich eine App die wirklich für <span className="text-primary">Schweizer Fahrlehrer</span> gemacht ist. Kein Excel mehr, keine vergessenen Rechnungen."
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold" style={{ borderRadius: "3px" }}>TK</div>
            <div className="text-left">
              <p className="text-background font-heading font-bold text-sm">Thomas Keller</p>
              <p className="text-background/60 text-xs font-body">Fahrlehrer · fahrschule me, Wettingen</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-section-alt py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-heading font-bold uppercase tracking-widest mb-2">Häufige Fragen</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-card border border-border p-5 group" style={{ borderRadius: "3px" }}>
                <summary className="font-heading font-bold text-foreground cursor-pointer flex items-center justify-between text-sm uppercase tracking-wide">
                  {f.q}
                  <span className="text-primary group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-sm text-muted-foreground font-body mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-card py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">Bereit loszulegen?</h2>
          <p className="text-muted-foreground font-body mb-8">
            30 Tage gratis – keine Kreditkarte, keine Verpflichtung. Einfach registrieren und sofort starten.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity" style={{ borderRadius: "3px" }}>
              Jetzt kostenlos testen
            </a>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Direkt herunterladen:{" "}
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Store</a>
            {" · "}
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple App Store</a>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default FuerFahrlehrer;
