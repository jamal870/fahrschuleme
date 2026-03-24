import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bike, LogOut } from "lucide-react";
import { toast } from "sonner";
import AdminCourseDates from "@/components/admin/AdminCourseDates";
import AdminBookings from "@/components/admin/AdminBookings";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-primary bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-foreground">DRIVE ME</span>
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
          </TabsList>
          <TabsContent value="courses"><AdminCourseDates /></TabsContent>
          <TabsContent value="bookings"><AdminBookings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
