import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  badge: string | null;
  active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  category: string | null;
  discount_price: number | null;
  original_price: number | null;
}

const CATEGORIES = [
  { value: "", label: "— Keine (nur Anzeige) —" },
  { value: "mgk", label: "MGK (Motorrad Grundkurs)" },
  { value: "grundkurs", label: "Grundkurs (alle Kurstermine)" },
  { value: "fahrstunden_auto", label: "Fahrstunden Auto" },
  { value: "fahrstunden_motorrad", label: "Fahrstunden Motorrad" },
];

const empty = {
  title: "",
  description: "",
  price: "",
  badge: "",
  active: true,
  sort_order: 0,
  category: "",
  discount_price: "",
  original_price: "",
  starts_at: "",
  ends_at: "",
};

const AdminPromotions = () => {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data as Promotion[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title.trim()) { toast.error("Titel ist erforderlich"); return; }
    const { error } = await supabase.from("promotions").insert({
      title: form.title,
      description: form.description || null,
      price: form.price || null,
      badge: form.badge || null,
      active: form.active,
      sort_order: Number(form.sort_order) || 0,
      category: form.category || null,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      original_price: form.original_price ? Number(form.original_price) : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Aktion erstellt");
    setForm({ ...empty });
    load();
  };

  const update = async (id: string, patch: Partial<Promotion>) => {
    const { error } = await supabase.from("promotions").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Aktion löschen?")) return;
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Gelöscht"); load(); }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border p-6" style={{ borderRadius: "3px" }}>
        <h3 className="font-heading font-bold text-lg mb-4">Neue Aktion erstellen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Titel *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="z.B. Grundkurs Sommer Aktion" />
          </div>
          <div>
            <Label>Badge (optional)</Label>
            <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="z.B. SOMMER AKTION" />
          </div>
          <div>
            <Label>Kategorie (für automatische Preisanwendung)</Label>
            <select
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              style={{ borderRadius: "3px" }}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Aktionspreis (CHF, pro Lektion/Kursteil)</Label>
            <Input type="number" step="0.01" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} placeholder="z.B. 130" />
          </div>
          <div>
            <Label>Ursprünglicher Preis (für Durchstreich-Anzeige)</Label>
            <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="z.B. 160" />
          </div>
          <div>
            <Label>Preis-Text (Anzeige)</Label>
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="z.B. CHF 130.-" />
          </div>
          <div>
            <Label>Sortierung</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Gültig ab</Label>
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </div>
          <div>
            <Label>Gültig bis</Label>
            <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Beschreibung</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kurze Beschreibung der Aktion" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <Label>Aktiv (auf Website sichtbar & Preis wird angewendet)</Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 Wenn eine Kategorie + Aktionspreis gesetzt ist, wird dieser Preis während der Gültigkeit automatisch bei Buchungen verwendet.
        </p>
        <Button onClick={create} className="mt-4"><Plus className="w-4 h-4 mr-2" />Aktion hinzufügen</Button>
      </div>

      <div>
        <h3 className="font-heading font-bold text-lg mb-4">Bestehende Aktionen</h3>
        {loading ? (
          <p className="text-muted-foreground">Lädt...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">Noch keine Aktionen vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="bg-card border border-border p-4 flex flex-col md:flex-row md:items-center gap-4" style={{ borderRadius: "3px" }}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} />
                  <Input value={p.badge ?? ""} placeholder="Badge" onChange={(e) => update(p.id, { badge: e.target.value })} />
                  <Input value={p.price ?? ""} placeholder="Preis" onChange={(e) => update(p.id, { price: e.target.value })} />
                  <Input type="number" value={p.sort_order} onChange={(e) => update(p.id, { sort_order: Number(e.target.value) })} />
                  <Textarea className="md:col-span-4" value={p.description ?? ""} placeholder="Beschreibung" onChange={(e) => update(p.id, { description: e.target.value })} />
                </div>
                <div className="flex md:flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={p.active} onCheckedChange={(v) => update(p.id, { active: v })} />
                    <span className="text-xs font-body">{p.active ? "Aktiv" : "Aus"}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotions;
