import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  qualification: string | null;
  hobbies: string | null;
  character: string | null;
  motto: string | null;
  phone: string | null;
  sort_order: number;
  is_visible: boolean;
};

const emptyMember = (sort_order: number): Omit<TeamMember, "id"> => ({
  name: "",
  role: "",
  qualification: "",
  hobbies: "",
  character: "",
  motto: "",
  phone: "",
  sort_order,
  is_visible: true,
});

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftNew, setDraftNew] = useState<Omit<TeamMember, "id"> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("Laden fehlgeschlagen: " + error.message);
    else setMembers((data as TeamMember[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = <K extends keyof TeamMember>(id: string, key: K, value: TeamMember[K]) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));
  };

  const save = async (m: TeamMember) => {
    setSavingId(m.id);
    const { error } = await supabase
      .from("team_members")
      .update({
        name: m.name,
        role: m.role,
        qualification: m.qualification,
        hobbies: m.hobbies,
        character: m.character,
        motto: m.motto,
        phone: m.phone,
        sort_order: m.sort_order,
        is_visible: m.is_visible,
      })
      .eq("id", m.id);
    setSavingId(null);
    if (error) toast.error("Speichern fehlgeschlagen: " + error.message);
    else toast.success("Gespeichert");
  };

  const remove = async (id: string) => {
    if (!confirm("Team-Mitglied wirklich löschen?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) toast.error("Löschen fehlgeschlagen: " + error.message);
    else {
      toast.success("Gelöscht");
      load();
    }
  };

  const createNew = async () => {
    if (!draftNew) return;
    if (!draftNew.name || !draftNew.role) {
      toast.error("Name und Rolle sind Pflicht");
      return;
    }
    const { error } = await supabase.from("team_members").insert(draftNew);
    if (error) toast.error("Anlegen fehlgeschlagen: " + error.message);
    else {
      toast.success("Mitglied hinzugefügt");
      setDraftNew(null);
      load();
    }
  };

  if (loading) return <div className="text-muted-foreground font-body">Laden...</div>;

  const nextSort = (members.at(-1)?.sort_order ?? 0) + 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {!draftNew && (
          <Button onClick={() => setDraftNew(emptyMember(nextSort))} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Neues Mitglied
          </Button>
        )}
      </div>

      {draftNew && (
        <MemberCard
          member={{ ...draftNew, id: "__new__" }}
          onChange={(k, v) => setDraftNew((d) => (d ? { ...d, [k]: v } : d))}
          onSave={createNew}
          onCancel={() => setDraftNew(null)}
          saving={false}
          isNew
        />
      )}

      {members.map((m) => (
        <MemberCard
          key={m.id}
          member={m}
          onChange={(k, v) => updateField(m.id, k, v)}
          onSave={() => save(m)}
          onDelete={() => remove(m.id)}
          saving={savingId === m.id}
        />
      ))}

      {members.length === 0 && !draftNew && (
        <div className="text-center text-muted-foreground font-body py-8">Noch keine Team-Mitglieder.</div>
      )}
    </div>
  );
};

type CardProps = {
  member: TeamMember;
  onChange: <K extends keyof TeamMember>(key: K, value: TeamMember[K]) => void;
  onSave: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  saving: boolean;
  isNew?: boolean;
};

const MemberCard = ({ member, onChange, onSave, onDelete, onCancel, saving, isNew }: CardProps) => (
  <div className="bg-card border border-border p-5 space-y-4" style={{ borderRadius: "3px" }}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Name *">
        <Input value={member.name} onChange={(e) => onChange("name", e.target.value)} />
      </Field>
      <Field label="Rolle *">
        <Input value={member.role} onChange={(e) => onChange("role", e.target.value)} />
      </Field>
      <Field label="Qualifikation">
        <Input value={member.qualification ?? ""} onChange={(e) => onChange("qualification", e.target.value)} />
      </Field>
      <Field label="Telefon">
        <Input value={member.phone ?? ""} onChange={(e) => onChange("phone", e.target.value)} />
      </Field>
      <Field label="Hobbys">
        <Textarea rows={2} value={member.hobbies ?? ""} onChange={(e) => onChange("hobbies", e.target.value)} />
      </Field>
      <Field label="Charakter">
        <Textarea rows={2} value={member.character ?? ""} onChange={(e) => onChange("character", e.target.value)} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Motto / Bio">
          <Textarea rows={3} value={member.motto ?? ""} onChange={(e) => onChange("motto", e.target.value)} />
        </Field>
      </div>
      <Field label="Sortierung">
        <Input
          type="number"
          value={member.sort_order}
          onChange={(e) => onChange("sort_order", Number(e.target.value))}
        />
      </Field>
      <div className="flex items-center gap-3 pt-6">
        <Switch checked={member.is_visible} onCheckedChange={(v) => onChange("is_visible", v)} />
        <Label className="font-body">Auf /team sichtbar</Label>
      </div>
    </div>

    <div className="flex gap-2 justify-end pt-2 border-t border-border">
      {isNew && onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" /> Abbrechen
        </Button>
      )}
      {!isNew && onDelete && (
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" /> Löschen
        </Button>
      )}
      <Button size="sm" onClick={onSave} disabled={saving}>
        <Save className="w-4 h-4 mr-2" /> {saving ? "Speichern..." : isNew ? "Anlegen" : "Speichern"}
      </Button>
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="font-body text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default AdminTeam;
