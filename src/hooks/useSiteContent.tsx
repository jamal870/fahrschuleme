/**
 * Site Content – editable via Admin panel, with fallback to tenant.ts.
 *
 * Loads all rows from public.site_content on app start, exposes them via
 * React context. If a key is missing or the DB is unreachable, the values
 * from src/config/tenant.ts are used as a safety net.
 */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { tenantConfig } from "@/config/tenant";

export type PricingItem = { name: string; price: string; note?: string };
export type PricingExtra = { title: string; name: string; price: string; note?: string };

export type SiteContent = {
  brand: typeof tenantConfig.brand;
  contact: typeof tenantConfig.contact;
  legal: {
    ownerName: string;
    jurisdiction: string;
    standDate: string;
    processingFeeChf: string;
    latePaymentInterestPct: string;
    cancellationNoticeHours: string;
    medicalCertificateDays: string;
  };
  bank: {
    accountHolder: string;
    bank: string;
    iban: string;
    bic: string;
  };
  pricing_auto: PricingItem[];
  pricing_auto_abos: PricingItem[];
  pricing_motorrad: PricingItem[];
  pricing_motorrad_grundkurs: PricingItem[];
  pricing_extras: PricingExtra[];
  chatbot: typeof tenantConfig.chatbot;
  footer: typeof tenantConfig.footer;
};

export const DEFAULT_CONTENT: SiteContent = {
  brand: tenantConfig.brand,
  contact: tenantConfig.contact,
  legal: {
    ownerName: "Jimmy Ettanaghmalti",
    jurisdiction: "Wettingen, Kanton Aargau",
    standDate: "Juni 2026",
    processingFeeChf: "30.–",
    latePaymentInterestPct: "5",
    cancellationNoticeHours: "24",
    medicalCertificateDays: "5",
  },
  bank: {
    accountHolder: tenantConfig.booking.bankDetails?.accountHolder ?? "",
    bank: tenantConfig.booking.bankDetails?.bank ?? "",
    iban: tenantConfig.booking.bankDetails?.iban ?? "",
    bic: tenantConfig.booking.bankDetails?.bic ?? "",
  },
  pricing_auto: tenantConfig.pricing.auto,
  pricing_auto_abos: tenantConfig.pricing.autoAbos,
  pricing_motorrad: tenantConfig.pricing.motorrad,
  pricing_motorrad_grundkurs: tenantConfig.pricing.motorradGrundkurs,
  pricing_extras: tenantConfig.pricing.extras,
  chatbot: tenantConfig.chatbot,
  footer: tenantConfig.footer,
};

type Ctx = {
  content: SiteContent;
  loading: boolean;
  reload: () => Promise<void>;
};

const SiteContentContext = createContext<Ctx>({
  content: DEFAULT_CONTENT,
  loading: false,
  reload: async () => {},
});

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error || !data) {
        setLoading(false);
        return;
      }
      const merged: SiteContent = { ...DEFAULT_CONTENT };
      for (const row of data) {
        const k = row.key as keyof SiteContent;
        if (k in merged && row.value != null) {
          // @ts-expect-error – JSON to typed shape, fallback handles mismatches
          merged[k] = row.value;
        }
      }
      setContent(merged);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SiteContentContext.Provider value={{ content, loading, reload: load }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
