import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { tenantConfig } from "@/config/tenant";

const navItem =
  "hover:text-primary transition-colors py-1 border-b-2 border-transparent";
const activeItem = "text-primary border-primary";

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1" onClick={close}>
          <BrandLogo imgClassName="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium font-body text-muted-foreground">
          <NavLink to="/fuer-fahrlehrer" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
            Für Fahrlehrer
          </NavLink>
          <span className="text-border">|</span>

          <NavLink to="/grundkurs" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
            Grundkurs
          </NavLink>
          <NavLink to="/fahrstunden" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
            Fahrstunden
          </NavLink>
          <div className="relative group">
            <NavLink to="/motorrad" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""} inline-flex items-center gap-1`}>
              Motorrad <ChevronDown className="w-3 h-3" />
            </NavLink>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="bg-card border border-border shadow-md min-w-[220px] py-2" style={{ borderRadius: "3px" }}>
                <Link to="/motorrad" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Motorrad Übersicht</Link>
                <Link to="/motorrad-grundkurs-wettingen" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Motorrad Grundkurs Wettingen</Link>
                <Link to="/grundkurs" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Grundkurs buchen</Link>
                <Link to="/preise" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Preise Motorrad</Link>
              </div>
            </div>
          </div>
          <div className="relative group">
            <NavLink to="/fahrschule-wettingen" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""} inline-flex items-center gap-1`}>
              Standorte <ChevronDown className="w-3 h-3" />
            </NavLink>
            <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="bg-card border border-border shadow-md min-w-[200px] py-2" style={{ borderRadius: "3px" }}>
                <Link to="/fahrschule-wettingen" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Fahrschule Wettingen</Link>
                <Link to="/fahrschule-baden" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Fahrschule Baden</Link>
              </div>
            </div>
          </div>
          <NavLink to="/preise" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
            Preise
          </NavLink>
          <NavLink to="/kontakt" className={({ isActive }) => `${navItem} ${isActive ? activeItem : ""}`}>
            Kontakt
          </NavLink>
          <a
            href={tenantConfig.booking.externalBookingUrl || "#/grundkurs"}
            target={tenantConfig.booking.externalBookingUrl ? "_blank" : undefined}
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
          className="md:hidden p-2 text-foreground hover:text-primary"
          aria-label={open ? "Menü schliessen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1 text-sm font-medium font-body text-muted-foreground">
            <NavLink to="/fuer-fahrlehrer" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Für Fahrlehrer
            </NavLink>
            <div className="h-px bg-border my-1" />
            <NavLink to="/grundkurs" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Grundkurs
            </NavLink>
            <NavLink to="/fahrstunden" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Fahrstunden
            </NavLink>
            <NavLink to="/motorrad" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Motorrad
            </NavLink>
            <NavLink to="/motorrad-grundkurs-wettingen" onClick={close} className={({ isActive }) => `py-2 pl-4 text-xs ${isActive ? "text-primary" : ""}`}>
              · MGK Wettingen
            </NavLink>
            <NavLink to="/fahrschule-wettingen" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Fahrschule Wettingen
            </NavLink>
            <NavLink to="/fahrschule-baden" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Fahrschule Baden
            </NavLink>
            <NavLink to="/preise" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Preise
            </NavLink>
            <NavLink to="/kontakt" onClick={close} className={({ isActive }) => `py-2 ${isActive ? "text-primary" : ""}`}>
              Kontakt
            </NavLink>
            <a
              href={tenantConfig.booking.externalBookingUrl || "#/grundkurs"}
              target={tenantConfig.booking.externalBookingUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={close}
              className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              style={{ borderRadius: "3px" }}
            >
              Jetzt Buchen
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteHeader;
