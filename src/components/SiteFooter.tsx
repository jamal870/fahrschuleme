import { Link } from "react-router-dom";
import { tenantConfig } from "@/config/tenant";

const SiteFooter = () => (
  <footer className="border-t-2 border-primary bg-card py-6">
    <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground font-body space-y-2">
      <div className="space-x-3">
        <Link to="/" className="hover:text-primary">Start</Link>
        <span>·</span>
        <Link to="/kurstermine" className="hover:text-primary">Kurstermine</Link>
        <span>·</span>
        <Link to="/kontakt" className="hover:text-primary">Kontakt</Link>
        <span>·</span>
        <Link to="/impressum" className="hover:text-primary">Impressum</Link>
        <span>·</span>
        <Link to="/datenschutz" className="hover:text-primary">Datenschutz</Link>
        <span>·</span>
        <Link to="/agb" className="hover:text-primary">AGB</Link>
      </div>
      <div>{tenantConfig.footer.copyright}</div>
    </div>
  </footer>
);

export default SiteFooter;
