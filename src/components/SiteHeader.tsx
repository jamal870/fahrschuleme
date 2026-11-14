import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, X, UserCircle2, Phone } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { tenantConfig } from "@/config/tenant";
import { trackBookingClick } from "@/lib/analytics";

interface NavLinkItem {
  to: string;
  label: string;
  track?: string;
}

interface NavGroup {
  label: string;
  to: string;
  items: NavLinkItem[];
}

// Hauptmenü: drei Gruppen mit Untermenü, dann direkte Seiten.
const GROUPS: NavGroup[] = [
  {
    label: "Auto",
    to: "/autofuehrerschein-wettingen/",
    items: [
      { to: "/autofuehrerschein-wettingen/", label: "Autoführerschein Wettingen" },
      { to: "/fahrstunden/", label: "Fahrstunden" },
      { to: "/fuehrerausweis-ab-2027/", label: "Weg zum Führerausweis ab 2027" },
      { to: "/kosten-fuehrerschein-aargau/", label: "Kosten Führerschein Aargau" },
      { to: "/wie-viele-fahrstunden/", label: "Wie viele Fahrstunden?" },
    ],
  },
  {
    label: "Motorrad",
    to: "/motorrad/",
    items: [
      { to: "/motorrad/", label: "Motorrad Übersicht" },
      { to: "/grundkurs/", label: "Grundkurs buchen", track: "Grundkurs buchen (Menü)" },
      { to: "/kurstermine/", label: "Kurstermine" },
      { to: "/motorrad-grundkurs-wettingen/", label: "Motorrad-Grundkurs Wettingen" },
      { to: "/a1-fuehrerschein-wettingen/", label: "A1 Führerschein" },
      { to: "/motorrad-kategorien-vergleich/", label: "Kategorien im Vergleich" },
    ],
  },
  {
    label: "Standorte",
    to: "/fahrschule-wettingen/",
    items: [
      { to: "/fahrschule-wettingen/", label: "Fahrschule Wettingen" },
      { to: "/fahrschule-baden/", label: "Fahrschule Baden" },
      { to: "/fahrschule-neuenhof/", label: "Fahrschule Neuenhof" },
      { to: "/fahrschule-spreitenbach/", label: "Fahrschule Spreitenbach" },
    ],
  },
];

const COURSES: NavLinkItem[] = [
  { to: "/nothelferkurs-wettingen/", label: "Nothelferkurs" },
  { to: "/verkehrskunde-wettingen/", label: "VKU" },
];

const SECONDARY: NavLinkItem[] = [
  { to: "/preise/", label: "Preise" },
  { to: "/kontakt/", label: "Kontakt" },
];

const navItem = "hover:text-primary transition-colors py-1.5 border-b-2 border-transparent";
const activeItem = "text-primary border-primary";

const bookingHref = tenantConfig.booking.externalBookingUrl || "/grundkurs/";
const bookingExternal = Boolean(tenantConfig.booking.externalBookingUrl);
const phoneHref = `tel:${tenantConfig.contact.phone.replace(/\s/g, "")}`;

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const close = () => {
    setOpen(false);
    setOpenGroup(null);
  };

  return (
    <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary shadow-soft">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 shrink-0" onClick={close}>
          <BrandLogo imgClassName="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center gap-6 text-[15px] font-semibold font-body text-foreground/80 tracking-[0.005em] whitespace-nowrap">
          {GROUPS.map((g) => (
            <div key={g.label} className="relative group">
              <NavLink
                to={g.to}
                className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""} inline-flex items-center gap-1`}
              >
                {g.label} <ChevronDown className="w-3 h-3" />
              </NavLink>
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                <div className="bg-card border border-border shadow-md min-w-[240px] py-2" style={{ borderRadius: "3px" }}>
                  {g.items.map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={it.track ? () => trackBookingClick(it.track!) : undefined}
                      className="block px-4 py-2 text-sm font-medium hover:bg-section-alt hover:text-primary"
                    >
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {[...COURSES, ...SECONDARY].map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
              {it.label}
            </NavLink>
          ))}
          <a
            href={phoneHref}
            aria-label="Anrufen"
            title="Anrufen"
            className="inline-flex items-center justify-center w-9 h-9 border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
            style={{ borderRadius: "3px" }}
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={bookingHref}
            target={bookingExternal ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
            style={{ borderRadius: "3px" }}
          >
            Jetzt Buchen
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="xl:hidden p-2 text-foreground hover:text-primary"
          aria-label={open ? "Menü schliessen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="xl:hidden border-t border-border bg-card max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 pt-2 pb-5 font-body">
            {/* Hauptpunkte */}
            <ul className="divide-y divide-border">
              {GROUPS.map((g) => {
                const expanded = openGroup === g.label;
                return (
                  <li key={g.label}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpenGroup(expanded ? null : g.label)}
                      className="w-full flex items-center justify-between py-3.5 text-base font-heading font-bold text-foreground"
                    >
                      {g.label}
                      <ChevronDown className={`w-4 h-4 text-primary transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                      <ul className="mb-3 ml-1 border-l-2 border-primary/40 pl-4 space-y-0.5">
                        {g.items.map((it) => (
                          <li key={it.to}>
                            <NavLink
                              to={it.to}
                              onClick={() => {
                                if (it.track) trackBookingClick(it.track);
                                close();
                              }}
                              className={({ isActive }) =>
                                `block py-2 text-[15px] font-medium ${isActive ? "text-primary" : "text-foreground/80"}`
                              }
                            >
                              {it.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
              {COURSES.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    onClick={close}
                    className={({ isActive }) =>
                      `block py-3.5 text-base font-heading font-bold ${isActive ? "text-primary" : "text-foreground"}`
                    }
                  >
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Weitere Seiten */}
            <ul className="border-t border-border pt-1">
              {SECONDARY.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    onClick={close}
                    className={({ isActive }) =>
                      `block py-2.5 text-[15px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`
                    }
                  >
                    {it.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Aktionen */}
            <div className="mt-3 grid gap-2.5">
              <a
                href={bookingHref}
                target={bookingExternal ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={close}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
                style={{ borderRadius: "3px" }}
              >
                Jetzt Buchen
              </a>
              <a
                href={phoneHref}
                onClick={close}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-primary text-primary font-heading font-bold text-sm uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{ borderRadius: "3px" }}
              >
                <Phone className="w-4 h-4" /> Anrufen
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground/80">
              <Link to="/fuer-fahrlehrer/" onClick={close} className="hover:text-primary">
                Für Fahrlehrer
              </Link>
              <Link
                to="/admin/login"
                onClick={close}
                className="inline-flex items-center gap-1.5 hover:text-primary"
                aria-label="Admin Login"
              >
                <UserCircle2 className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteHeader;
