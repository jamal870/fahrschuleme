import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Erfolgreich eingeloggt");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" style={{ borderRadius: "3px" }}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BrandLogo imgClassName="h-12 w-auto" />
          </div>
          <CardTitle className="text-lg font-heading uppercase">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body">E-Mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Passwort</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="font-body" />
            </div>
            <Button type="submit" className="w-full font-heading uppercase" disabled={loading} style={{ borderRadius: "3px" }}>
              <Lock className="w-4 h-4 mr-2" />
              {loading ? "Wird eingeloggt..." : "Einloggen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
