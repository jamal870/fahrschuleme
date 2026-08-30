import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bike, LogOut, Globe } from "lucide-react";
import { toast } from "sonner";
import AdminCourseDates from "@/components/admin/AdminCourseDates";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminParticipants from "@/components/admin/AdminParticipants";

import AdminTeam from "@/components/admin/AdminTeam";
import AdminPhotoImport from "@/components/admin/AdminPhotoImport";
import AdminPromotions from "@/components/admin/AdminPromotions";
import AdminEmailSettings from "@/components/admin/AdminEmailSettings";
import AdminContent from "@/components/admin/AdminContent";
import AdminAssistant from "@/components/admin/AdminAssistant";
import AdminAiSettings from "@/components/admin/AdminAiSettings";
import AdminPresentations from "@/components/admin/AdminPresentations";

import BrandLogo from "@/components/BrandLogo";
import ChangePasswordDialog from "@/components/admin/ChangePasswordDialog";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      let admin = !!roleData;
      let failed = false;

      if (roleError) {
        // Fallback: SECURITY-DEFINER-Funktion (funktioniert auch ohne Tabellen-Leserecht)
        const { data: rpcData, error: rpcError } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (rpcError) {
          failed = true;
          console.error("Rollenprüfung fehlgeschlagen:", roleError.message, rpcError.message);
        } else {
          admin = rpcData === true;
        }
      }

      if (failed) {
        setAccessError("Rollenprüfung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.");
      } else if (!admin) {
        setAccessError("Kein Admin-Zugriff. Ihr Konto besitzt nicht die erforderliche Admin-Rolle für den Bereich „Kurstermine“ und die Verwaltung.");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);

    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Abgemeldet");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground font-body">Laden...</div>;

  if (accessError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-card border-2 border-destructive p-8 text-center space-y-4" style={{ borderRadius: "3px" }}>
          <h1 className="font-heading font-bold text-2xl text-destructive">Zugriff verweigert</h1>
          <p className="font-body text-foreground">{accessError}</p>
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="outline" onClick={() => navigate("/")} className="font-body">Zur Startseite</Button>
            <Button onClick={handleLogout} className="font-body">Abmelden</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-section-alt">
      <header className="sticky top-0 z-40 border-b-2 border-primary bg-card shadow-soft">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo imgClassName="h-10 w-auto" />
            <span className="text-xs bg-gradient-primary text-primary-foreground px-2.5 py-1 font-heading font-bold tracking-wide rounded-lg shadow-glow">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="font-body rounded-lg">
              <Globe className="w-4 h-4 mr-2" /> Zur Webseite
            </Button>
            <ChangePasswordDialog />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="font-body rounded-lg">
              <LogOut className="w-4 h-4 mr-2" /> Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="bg-card border border-border p-1.5 h-auto flex-wrap gap-1 rounded-lg shadow-soft">
            {[
              ["courses", "Kurstermine"],
              ["photo", "Foto-Planung"],
              ["bookings", "Buchungen"],
              ["participants", "Teilnehmer"],
              ["team", "Team"],
              ["promotions", "Aktionen"],
              ["emails", "E-Mails"],
              ["content", "Inhalte & Preise"],
              ["assistant", "KI-Assistent"],
              ["ai-settings", "KI-Keys"],
              ["presentations", "Präsentationen"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="sheen font-heading text-sm font-semibold tracking-tight rounded-lg px-4 py-2 transition-all data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow data-[state=inactive]:text-muted-foreground hover:text-primary hover:bg-section-alt"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>


          <TabsContent value="courses"><AdminCourseDates /></TabsContent>
          <TabsContent value="photo"><AdminPhotoImport /></TabsContent>
          <TabsContent value="bookings"><AdminBookings /></TabsContent>
          <TabsContent value="participants"><AdminParticipants /></TabsContent>
          
          
          
          
          <TabsContent value="team"><AdminTeam /></TabsContent>
          <TabsContent value="promotions"><AdminPromotions /></TabsContent>
          <TabsContent value="emails"><AdminEmailSettings /></TabsContent>
          <TabsContent value="content"><AdminContent /></TabsContent>
          <TabsContent value="assistant"><AdminAssistant /></TabsContent>
          <TabsContent value="ai-settings"><AdminAiSettings /></TabsContent>
          <TabsContent value="presentations"><AdminPresentations /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
