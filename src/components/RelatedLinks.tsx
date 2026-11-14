import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PARTNER_LINK_REL } from "@/lib/booking-links";

export interface RelatedLink {
  to: string;
  title: string;
  desc: string;
}

const RelatedLinks = ({ heading = "Das könnte dich auch interessieren", links }: { heading?: string; links: RelatedLink[] }) => {
  if (!links.length) return null;
  return (
    <section className="bg-background py-14 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {links.map((l, i) => {
            const external = /^https?:\/\//.test(l.to);
            const className = "group bg-card border border-border p-5 hover:border-primary transition-colors flex flex-col";
            const body = (
              <>
              <h3 className="font-heading font-bold text-foreground mb-2 text-base group-hover:text-primary transition-colors">
                {l.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed flex-1">{l.desc}</p>
              <span className="inline-flex items-center gap-1.5 text-primary font-heading font-bold text-xs uppercase tracking-wide mt-3">
                {external ? "Zum Partner" : "Mehr erfahren"}{" "}
                {external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />}
              </span>
              </>
            );
            return external ? (
              <a key={i} href={l.to} target="_blank" rel={PARTNER_LINK_REL} className={className} style={{ borderRadius: "3px" }}>
                {body}
              </a>
            ) : (
              <Link key={i} to={l.to} className={className} style={{ borderRadius: "3px" }}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedLinks;
