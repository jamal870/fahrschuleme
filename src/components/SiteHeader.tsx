import { Link, NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { tenantConfig } from "@/config/tenant";

const navItem =
  "hover:text-primary transition-colors py-1 border-b-2 border-transparent";
const activeItem = "text-primary border-primary";

const SiteHeader = () => {
  return (
    <nav className="sticky top-0 z-40 bg-card border-b-2 border-primary">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <BrandLogo imgClassName="h-12 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium font-body text-muted-foreground">
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
              <div className="bg-card border border-border shadow-md min-w-[180px] py-2" style={{ borderRadius: "3px" }}>
                <Link to="/motorrad" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Motorrad Übersicht</Link>
                <Link to="/grundkurs" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Grundkurs buchen</Link>
                <Link to="/preise" className="block px-4 py-2 text-sm hover:bg-section-alt hover:text-primary">Preise Motorrad</Link>
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
      </div>
    </nav>
  );
};

export default SiteHeader;
