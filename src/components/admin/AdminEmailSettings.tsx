import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

type Settings = {
  from_name: string;
  reply_to_email: string;
  footer_signature: string;
  bank_info: string;
  mgk_greeting_extra: string;
  mgk_meeting_point: string;
  mgk_important_notes: string;
  mgk_cancellation_policy: string;
  fahrstunden_greeting_extra: string;
  fahrstunden_meeting_point: string;
  fahrstunden_important_notes: string;
  reminder_extra_note: string;
};

const FIELDS: { key: keyof Settings; label: string; help?: string; type: "input" | "textarea"; rows?: number; group: string }[] = [
  { key: "from_name", label: "Absender-Name", help: "Erscheint im Posteingang als Absender (z. B. Drive me Fahrschule)", type: "input", group: "Absender" },
  { key: "reply_to_email", label: "Antwort-Adresse (Reply-To)", help: "An diese Adresse antworten Kunden, wenn sie auf «Antworten» klicken", type: "input", group: "Absender" },
  { key: "footer_signature", label: "Footer / Signatur", help: "Schlusszeile aller Kunden-Mails", type: "textarea", rows: 3, group: "Absender" },
  { key: "bank_info", label: "Bankverbindung", help: "Wird in beiden Bestätigungs-Mails angezeigt", type: "textarea", rows: 5, group: "Allgemein" },

  { key: "mgk_greeting_extra", label: "Begrüssungs-Text", type: "textarea", rows: 2, group: "MGK-Buchungsbestätigung" },
  { key: "mgk_meeting_point", label: "Treffpunkt", type: "textarea", rows: 5, group: "MGK-Buchungsbestätigung" },
  { key: "mgk_important_notes", label: "Wichtige Hinweise", type: "textarea", rows: 4, group: "MGK-Buchungsbestätigung" },
  { key: "mgk_cancellation_policy", label: "Stornierungsbedingungen", type: "textarea", rows: 3, group: "MGK-Buchungsbestätigung" },

  { key: "fahrstunden_greeting_extra", label: "Begrüssungs-Text", type: "textarea", rows: 2, group: "Fahrstunden-Bestätigung" },
  { key: "fahrstunden_meeting_point", label: "Treffpunkt", type: "textarea", rows: 3, group: "Fahrstunden-Bestätigung" },
  { key: "fahrstunden_important_notes", label: "Wichtige Hinweise / Storno", type: "textarea", rows: 3, group: "Fahrstunden-Bestätigung" },

  { key: "reminder_extra_note", label: "Zusatz-Hinweis", help: "Wird unten in der Kurs-Erinnerung an dich angezeigt", type: "textarea", rows: 2, group: "Kurs-Erinnerung (intern)" },
];

const AdminEmailSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("email_settings").select("*").eq("id", 1).maybeSingle();
    if (error) toast.error("Fehler beim Laden: " + error.message);
    else if (data) setSettings(data as Settings);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("email_settings").update(settings).eq("id", 1);
    if (error) toast.error("Fehler beim Speichern: " + error.message);
    else toast.success("E-Mail-Einstellungen gespeichert");
    setSaving(false);
  };

  if (loading || !settings) {
    return <Card><CardContent className="p-6 text-center text-muted-foreground">Laden...</CardContent></Card>;
  }

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-[Outfit]">E-Mail-Einstellungen</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Diese Texte werden in den E-Mails an Kunden verwendet. Änderungen wirken sofort bei neuen Mails.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Neu laden
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? "Speichert..." : "Speichern"}
          </Button>
        </div>
      </div>

      {groups.map((group) => (
        <Card key={group}>
          <CardContent className="p-5 space-y-4">
            <h3 className="font-heading font-bold uppercase text-sm text-primary">{group}</h3>
            {FIELDS.filter((f) => f.group === group).map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-sm font-medium">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    rows={f.rows || 3}
                    value={(settings[f.key] as string) || ""}
                    onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={f.key}
                    value={(settings[f.key] as string) || ""}
                    onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  />
                )}
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-1" /> {saving ? "Speichert..." : "Alle Änderungen speichern"}
        </Button>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
