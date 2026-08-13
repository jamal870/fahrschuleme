import { Link, useNavigate } from "react-router-dom";
import { trackBookingClick } from "@/lib/analytics";
import { ArrowRight, ExternalLink } from "lucide-react";

export interface TrackedCtaProps {
  /** Destination: internal path (e.g. "/grundkurs") or absolute URL. */
  to: string;
  /** Visible label, also used as event label. */
  label: string;
  /** Force external-link behaviour (new tab, no router navigation). */
  external?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles (mainly for the 3px border-radius token). */
  style?: React.CSSProperties;
  /** Optional conversion value in CHF. */
  value?: number;
  /** Show an arrow or external-link icon. */
  icon?: "arrow" | "external" | "none";
  /** Optional click handler that runs after tracking. */
  onClick?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

const BASE_PRIMARY =
  "inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity";

const TrackedCta = ({
  to,
  label,
  external,
  className = BASE_PRIMARY,
  style = { borderRadius: "3px" },
  value,
  icon = "arrow",
  onClick,
  children,
}: TrackedCtaProps) => {
  const navigate = useNavigate();
  const isExternal = external || /^https?:\/\//.test(to);

  const handleClick = (e: React.MouseEvent) => {
    trackBookingClick(label, value);
    onClick?.(e);

    if (isExternal) {
      // Let the native anchor open the new tab; gtag hit is synchronous enough.
      return;
    }

    e.preventDefault();
    // Tiny delay gives the dataLayer push time to fire before SPA navigation.
    setTimeout(() => navigate(to), 80);
  };

  const iconNode =
    icon === "external" ? (
      <ExternalLink className="w-4 h-4" />
    ) : icon === "arrow" ? (
      <ArrowRight className="w-4 h-4" />
    ) : null;

  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
        onClick={handleClick}
      >
        {children ?? label}
        {iconNode}
      </a>
    );
  }

  return (
    <Link to={to} className={className} style={style} onClick={handleClick}>
      {children ?? label}
      {iconNode}
    </Link>
  );
};

export default TrackedCta;
