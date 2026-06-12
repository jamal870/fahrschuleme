import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bike, LogOut } from "lucide-react";
import { toast } from "sonner";
import AdminCourseDates from "@/components/admin/AdminCourseDates";
import AdminBookings from "@/components/admin/AdminBookings";
import AdminWaitlist from "@/components/admin/AdminWaitlist";
import AdminTeam from "@/components/admin/AdminTeam";

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

      if (roleError) {
        setAccessError("Rollenprüfung fehlgeschlagen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.");
      } else if (!roleData) {
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
          <h1 className="font-heading font-bold text-2xl text-destructive uppercase">Zugriff verweigert</h1>
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
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-primary bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo imgClassName="h-10 w-auto" />
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 font-heading font-bold" style={{ borderRadius: "3px" }}>ADMIN</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="font-body">
            <LogOut className="w-4 h-4 mr-2" /> Abmelden
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses" className="font-heading uppercase text-xs">Kurstermine</TabsTrigger>
            <TabsTrigger value="bookings" className="font-heading uppercase text-xs">Buchungen</TabsTrigger>
            <TabsTrigger value="waitlist" className="font-heading uppercase text-xs">Warteliste</TabsTrigger>
            <TabsTrigger value="team" className="font-heading uppercase text-xs">Team</TabsTrigger>
          </TabsList>
          <TabsContent value="courses"><AdminCourseDates /></TabsContent>
          <TabsContent value="bookings"><AdminBookings /></TabsContent>
          <TabsContent value="waitlist"><AdminWaitlist /></TabsContent>
          <TabsContent value="team"><AdminTeam /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
