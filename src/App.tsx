import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import GrundkursBuchen from "./pages/GrundkursBuchen.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import BuchungErfolgreich from "./pages/BuchungErfolgreich.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import Impressum from "./pages/Impressum.tsx";
import Datenschutz from "./pages/Datenschutz.tsx";
import AGB from "./pages/AGB.tsx";
import Team from "./pages/Team.tsx";
import MotorradFuehrerscheinWettingen from "./pages/MotorradFuehrerscheinWettingen.tsx";
import MotorradGrundkursWettingen from "./pages/MotorradGrundkursWettingen.tsx";
import FahrschuleWettingen from "./pages/FahrschuleWettingen.tsx";
import FahrschuleBaden from "./pages/FahrschuleBaden.tsx";
import FahrschuleNeuenhof from "./pages/FahrschuleNeuenhof.tsx";
import FahrschuleSpreitenbach from "./pages/FahrschuleSpreitenbach.tsx";
import MotorradFuehrerscheinBaden from "./pages/MotorradFuehrerscheinBaden.tsx";
import NothelferkursWettingen from "./pages/NothelferkursWettingen.tsx";
import VerkehrskundeWettingen from "./pages/VerkehrskundeWettingen.tsx";
import Fahrstunden from "./pages/Fahrstunden.tsx";
import Motorrad from "./pages/Motorrad.tsx";
import Preise from "./pages/Preise.tsx";
import Kontakt from "./pages/Kontakt.tsx";
import Kurstermine from "./pages/Kurstermine.tsx";
import Angebote from "./pages/Angebote.tsx";
import StrassenverkehrsamtAargau from "./pages/StrassenverkehrsamtAargau.tsx";
import FuerFahrlehrer from "./pages/FuerFahrlehrer.tsx";
import NotFound from "./pages/NotFound.tsx";
import WhatsAppFloat from "./components/WhatsAppFloat.tsx";
import { SiteContentProvider } from "@/hooks/useSiteContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteContentProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
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
          <Route path="/fuer-fahrlehrer" element={<FuerFahrlehrer />} />
          <Route path="/app" element={<FuerFahrlehrer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <WhatsAppFloat />
      </HashRouter>
    </TooltipProvider>
    </SiteContentProvider>
  </QueryClientProvider>
);

export default App;
