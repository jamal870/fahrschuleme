import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import WhatsAppFloat from "./components/WhatsAppFloat.tsx";
import { SiteContentProvider } from "@/hooks/useSiteContent";

// Nur die Startseite wird eager geladen (häufigster Einstiegspunkt).
// Alle anderen Routen werden lazy geladen, damit das initiale JS-Bundle
// klein bleibt (Core Web Vitals / Ladezeit als Rankingfaktor).
const GrundkursBuchen = lazy(() => import("./pages/GrundkursBuchen.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const BuchungErfolgreich = lazy(() => import("./pages/BuchungErfolgreich.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const Impressum = lazy(() => import("./pages/Impressum.tsx"));
const Datenschutz = lazy(() => import("./pages/Datenschutz.tsx"));
const AGB = lazy(() => import("./pages/AGB.tsx"));
const Team = lazy(() => import("./pages/Team.tsx"));
const MotorradFuehrerscheinWettingen = lazy(() => import("./pages/MotorradFuehrerscheinWettingen.tsx"));
const MotorradGrundkursWettingen = lazy(() => import("./pages/MotorradGrundkursWettingen.tsx"));
const FahrschuleWettingen = lazy(() => import("./pages/FahrschuleWettingen.tsx"));
const FahrschuleBaden = lazy(() => import("./pages/FahrschuleBaden.tsx"));
const FahrschuleNeuenhof = lazy(() => import("./pages/FahrschuleNeuenhof.tsx"));
const FahrschuleSpreitenbach = lazy(() => import("./pages/FahrschuleSpreitenbach.tsx"));
const MotorradFuehrerscheinBaden = lazy(() => import("./pages/MotorradFuehrerscheinBaden.tsx"));
const NothelferkursWettingen = lazy(() => import("./pages/NothelferkursWettingen.tsx"));
const VerkehrskundeWettingen = lazy(() => import("./pages/VerkehrskundeWettingen.tsx"));
const Fahrstunden = lazy(() => import("./pages/Fahrstunden.tsx"));
const Motorrad = lazy(() => import("./pages/Motorrad.tsx"));
const Preise = lazy(() => import("./pages/Preise.tsx"));
const Kontakt = lazy(() => import("./pages/Kontakt.tsx"));
const Kurstermine = lazy(() => import("./pages/Kurstermine.tsx"));
const Angebote = lazy(() => import("./pages/Angebote.tsx"));
const StrassenverkehrsamtAargau = lazy(() => import("./pages/StrassenverkehrsamtAargau.tsx"));
const KostenFuehrerscheinAargau = lazy(() => import("./pages/KostenFuehrerscheinAargau.tsx"));
const MotorradKategorienVergleich = lazy(() => import("./pages/MotorradKategorienVergleich.tsx"));
const WieVieleFahrstunden = lazy(() => import("./pages/WieVieleFahrstunden.tsx"));
const FuerFahrlehrer = lazy(() => import("./pages/FuerFahrlehrer.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteContentProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <main>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/grundkurs" element={<GrundkursBuchen />} />
          <Route path="/grundkurs-buchen" element={<GrundkursBuchen />} />
          <Route path="/buchung-erfolgreich" element={<BuchungErfolgreich />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </main>
        <WhatsAppFloat />
      </BrowserRouter>
    </TooltipProvider>
    </SiteContentProvider>
  </QueryClientProvider>
);

export default App;
