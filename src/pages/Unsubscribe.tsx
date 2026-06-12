import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Bike, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already_unsubscribed");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <nav className="absolute top-0 left-0 right-0 max-w-5xl mx-auto px-6 py-5 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo imgClassName="h-12 w-auto" />
        </Link>
      </nav>

      <div className="text-center max-w-md">
        {status === "loading" && <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />}

        {status === "valid" && (
          <>
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-[Outfit] text-foreground mb-2">E-Mail-Abmeldung</h1>
            <p className="text-muted-foreground mb-6">Möchtest du dich wirklich von unseren E-Mails abmelden?</p>
            <Button onClick={handleUnsubscribe} variant="destructive">Abmeldung bestätigen</Button>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-[Outfit] text-foreground mb-2">Erfolgreich abgemeldet</h1>
            <p className="text-muted-foreground mb-6">Du erhältst keine weiteren E-Mails von uns.</p>
            <Button asChild><Link to="/">Zur Startseite</Link></Button>
          </>
        )}

        {status === "already_unsubscribed" && (
          <>
            <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-[Outfit] text-foreground mb-2">Bereits abgemeldet</h1>
            <p className="text-muted-foreground mb-6">Du bist bereits von unseren E-Mails abgemeldet.</p>
            <Button asChild><Link to="/">Zur Startseite</Link></Button>
          </>
        )}

        {status === "invalid" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-[Outfit] text-foreground mb-2">Ungültiger Link</h1>
            <p className="text-muted-foreground mb-6">Dieser Abmeldelink ist ungültig oder abgelaufen.</p>
            <Button asChild><Link to="/">Zur Startseite</Link></Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-[Outfit] text-foreground mb-2">Fehler</h1>
            <p className="text-muted-foreground mb-6">Etwas ist schiefgelaufen. Bitte versuche es später erneut.</p>
            <Button asChild><Link to="/">Zur Startseite</Link></Button>
          </>
        )}
      </div>
    </div>
  );
}
