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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
