interface PromoPriceProps {
  /** Freitext-Preis aus dem Admin, z.B. "CHF 90.-" */
  price?: string | null;
  originalPrice?: number | null;
  discountPrice?: number | null;
  className?: string;
}

const chf = (v: number) => `CHF ${Number(v).toFixed(0)}.-`;

/**
 * Auffällige Preisdarstellung für Aktionen:
 * durchgestrichener Originalpreis, grosser Aktionspreis und Spar-Badge.
 */
const PromoPrice = ({ price, originalPrice, discountPrice, className = "" }: PromoPriceProps) => {
  const hasPrice = Boolean(price) || discountPrice != null;
  if (!hasPrice) return null;

  const display = price || (discountPrice != null ? chf(discountPrice) : "");
  const saving =
    originalPrice != null && discountPrice != null && originalPrice > discountPrice
      ? originalPrice - discountPrice
      : null;
  const percent = saving != null && originalPrice ? Math.round((saving / originalPrice) * 100) : null;

  return (
    <div
      className={`relative mt-5 p-4 border border-primary/30 bg-primary/5 ${className}`}
      style={{ borderRadius: "3px" }}
    >
      {percent != null && (
        <span
          className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-widest px-2.5 py-1"
          style={{ borderRadius: "3px" }}
        >
          −{percent}%
        </span>
      )}

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <span className="block text-[10px] font-body text-muted-foreground uppercase tracking-widest mb-1">
            Aktionspreis
          </span>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-heading font-bold text-4xl leading-none text-primary">{display}</span>
            {originalPrice != null && (
              <span className="font-body text-base text-muted-foreground line-through">{chf(originalPrice)}</span>
            )}
          </div>
        </div>

        {saving != null && (
          <span className="font-heading font-bold text-xs uppercase tracking-wide text-primary bg-primary/15 px-3 py-1.5" style={{ borderRadius: "3px" }}>
            Du sparst {chf(saving)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PromoPrice;
