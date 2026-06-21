import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  label: string;
  to?: string; // wenn leer → aktuelle Seite
}

const SITE_URL = "https://fahrschule-me.ch";

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
  const all: BreadcrumbItem[] = [{ label: "Start", to: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.label,
      item: it.to ? `${SITE_URL}/#${it.to}` : undefined,
    })),
  };

  return (
    <nav aria-label="Brotkrumen" className="bg-background border-b border-border">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <ol className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-1.5 text-xs font-body text-muted-foreground overflow-x-auto whitespace-nowrap">
        {all.map((it, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/50" />}
              {isLast || !it.to ? (
                <span className="text-foreground font-heading font-bold" aria-current="page">
                  {it.label}
                </span>
              ) : (
                <Link to={it.to} className="hover:text-primary transition-colors flex items-center gap-1">
                  {i === 0 && <Home className="w-3 h-3" />}
                  {it.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
