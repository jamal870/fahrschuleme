// Build-time SSR entry: renders each public page's real markup (H1, body
// text, FAQs, JSON-LD) to a static HTML string so crawlers that don't
// execute JavaScript still see actual content — not just an empty
// <div id="root">. Used by scripts/prerender.mjs after `vite build`.
//
// Only routes listed in scripts/seo-routes.mjs are rendered here (booking,
// admin and account flows are intentionally excluded — they need live data
// and JS anyway, so they keep the old meta-only shell).
//
// Effects (useEffect) never run during renderToStaticMarkup, so any page
// that fetches data on mount (Supabase, react-query) simply renders its
// synchronous default/loading state here. That's fine for pages built on
// static props (all current SEO_ROUTES pages); it's not fine for pages that
// need fetched data to show anything meaningful, which is why those aren't
// in SEO_ROUTES.
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteContentProvider } from "@/hooks/useSiteContent";
import Index from "@/pages/Index";
import GrundkursBuchen from "@/pages/GrundkursBuchen";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import AGB from "@/pages/AGB";
import Team from "@/pages/Team";
import MotorradFuehrerscheinWettingen from "@/pages/MotorradFuehrerscheinWettingen";
import MotorradGrundkursWettingen from "@/pages/MotorradGrundkursWettingen";
import FahrschuleWettingen from "@/pages/FahrschuleWettingen";
import FahrschuleBaden from "@/pages/FahrschuleBaden";
import FahrschuleNeuenhof from "@/pages/FahrschuleNeuenhof";
import FahrschuleSpreitenbach from "@/pages/FahrschuleSpreitenbach";
import MotorradFuehrerscheinBaden from "@/pages/MotorradFuehrerscheinBaden";
import NothelferkursWettingen from "@/pages/NothelferkursWettingen";
import VerkehrskundeWettingen from "@/pages/VerkehrskundeWettingen";
import Fahrstunden from "@/pages/Fahrstunden";
import Motorrad from "@/pages/Motorrad";
import Preise from "@/pages/Preise";
import Kontakt from "@/pages/Kontakt";
import Kurstermine from "@/pages/Kurstermine";
import Angebote from "@/pages/Angebote";
import StrassenverkehrsamtAargau from "@/pages/StrassenverkehrsamtAargau";
import KostenFuehrerscheinAargau from "@/pages/KostenFuehrerscheinAargau";
import MotorradKategorienVergleich from "@/pages/MotorradKategorienVergleich";
import WieVieleFahrstunden from "@/pages/WieVieleFahrstunden";
import FuerFahrlehrer from "@/pages/FuerFahrlehrer";

export interface SsrHead {
  title: string;
  meta: string;
  link: string;
  script: string;
}

export interface SsrResult {
  bodyHtml: string;
  head: SsrHead;
}

const SsrRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/grundkurs" element={<GrundkursBuchen />} />
    <Route path="/grundkurs-buchen" element={<GrundkursBuchen />} />
    <Route path="/impressum" element={<Impressum />} />
    <Route path="/datenschutz" element={<Datenschutz />} />
    <Route path="/agb" element={<AGB />} />
    <Route path="/team" element={<Team />} />
    <Route path="/motorrad-fuehrerschein-wettingen" element={<MotorradFuehrerscheinWettingen />} />
    <Route path="/motorrad-fuhrerschein-wettingen" element={<MotorradFuehrerscheinWettingen />} />
    <Route path="/motorrad-grundkurs-wettingen" element={<MotorradGrundkursWettingen />} />
    <Route path="/fahrschule-wettingen" element={<FahrschuleWettingen />} />
    <Route path="/fahrschule-baden" element={<FahrschuleBaden />} />
    <Route path="/fahrschule-neuenhof" element={<FahrschuleNeuenhof />} />
    <Route path="/fahrschule-spreitenbach" element={<FahrschuleSpreitenbach />} />
    <Route path="/motorrad-fuehrerschein-baden" element={<MotorradFuehrerscheinBaden />} />
    <Route path="/motorrad-fuhrerschein-baden" element={<MotorradFuehrerscheinBaden />} />
    <Route path="/nothelferkurs-wettingen" element={<NothelferkursWettingen />} />
    <Route path="/verkehrskunde-wettingen" element={<VerkehrskundeWettingen />} />
    <Route path="/fahrstunden" element={<Fahrstunden />} />
    <Route path="/motorrad" element={<Motorrad />} />
    <Route path="/preise" element={<Preise />} />
    <Route path="/kontakt" element={<Kontakt />} />
    <Route path="/kurstermine" element={<Kurstermine />} />
    <Route path="/angebote" element={<Angebote />} />
    <Route path="/aktionen" element={<Angebote />} />
    <Route path="/strassenverkehrsamt-aargau" element={<StrassenverkehrsamtAargau />} />
    <Route path="/kosten-fuehrerschein-aargau" element={<KostenFuehrerscheinAargau />} />
    <Route path="/motorrad-kategorien-vergleich" element={<MotorradKategorienVergleich />} />
    <Route path="/wie-viele-fahrstunden" element={<WieVieleFahrstunden />} />
    <Route path="/fuer-fahrlehrer" element={<FuerFahrlehrer />} />
    <Route path="/app" element={<FuerFahrlehrer />} />
  </Routes>
);

const emptyHead: SsrHead = { title: "", meta: "", link: "", script: "" };

export function renderRoute(path: string): SsrResult {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const queryClient = new QueryClient();

  const bodyHtml = renderToStaticMarkup(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <SiteContentProvider>
          <TooltipProvider>
            <StaticRouter location={path}>
              <main>
                <SsrRoutes />
              </main>
            </StaticRouter>
          </TooltipProvider>
        </SiteContentProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );

  const helmet = helmetContext.helmet;
  const head: SsrHead = helmet
    ? {
        title: helmet.title.toString(),
        meta: helmet.meta.toString(),
        link: helmet.link.toString(),
        script: helmet.script.toString(),
      }
    : emptyHead;

  return { bodyHtml, head };
}
