import { tenantConfig } from "@/config/tenant";

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
  /** Optional override; defaults to tenantConfig.brand.logoUrl */
  src?: string;
  alt?: string;
}

/**
 * Universal brand logo. If a logoUrl is configured (or passed in), it renders
 * the image; otherwise it falls back to the stylized text logo.
 */
const BrandLogo = ({ className = "", imgClassName = "h-10 w-auto", src, alt }: BrandLogoProps) => {
  const url = src ?? tenantConfig.brand.logoUrl;
  const name = alt ?? tenantConfig.brand.name;
  const { logoText } = tenantConfig.brand;

  if (url) {
    return <img src={url} alt={name} className={`${imgClassName} ${className}`.trim()} />;
  }

  return (
    <div className={`flex flex-col items-start ${className}`.trim()}>
      <span className="flex items-baseline gap-0.5">
        <span
          className="text-[22px] font-heading font-bold text-foreground"
          style={{ letterSpacing: "0.05em" }}
        >
          {logoText.main}
        </span>
        <span
          className="text-[28px] text-primary"
          style={{ fontFamily: "'Kaushan Script', cursive" }}
        >
          {logoText.accent}
        </span>
      </span>
      {logoText.sub && (
        <span className="text-[10px] font-body text-muted-foreground -mt-1">
          {logoText.sub}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
