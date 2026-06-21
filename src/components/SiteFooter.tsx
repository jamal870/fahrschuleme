import { Link } from "react-router-dom";
import { UserCircle2 } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

const SiteFooter = () => {
  const { content } = useSiteContent();
  return (
    <footer className="border-t-2 border-primary bg-card py-6">
      <div className="max-w-6xl mx-auto px-6 text-center text-xs text-muted-foreground font-body space-y-2">
        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-primary">Start</Link>
          <span>·</span>
          <Link to="/kurstermine" className="hover:text-primary">Kurstermine</Link>
          <span>·</span>
          <Link to="/angebote" className="hover:text-primary">Angebote</Link>
          <span>·</span>
          <Link to="/kontakt" className="hover:text-primary">Kontakt</Link>
          <span>·</span>
          <Link to="/impressum" className="hover:text-primary">Impressum</Link>
          <span>·</span>
          <Link to="/datenschutz" className="hover:text-primary">Datenschutz</Link>
          <span>·</span>
          <Link to="/agb" className="hover:text-primary">AGB</Link>
          <span>·</span>
          <Link to="/admin/login" aria-label="Admin Login" title="Admin Login" className="inline-flex items-center text-muted-foreground/60 hover:text-primary transition-colors">
            <UserCircle2 className="w-4 h-4" />
          </Link>
        </div>
        <div>{content.footer.copyright}</div>
      </div>
    </footer>
  );
};

export default SiteFooter;
