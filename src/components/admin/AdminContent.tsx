import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Plus, Trash2, ExternalLink, RotateCcw } from "lucide-react";
import { DEFAULT_CONTENT, PricingItem, PricingExtra, useSiteContent } from "@/hooks/useSiteContent";

type Rows = Record<string, unknown>;

const PREVIEW_LINKS: Record<string, string> = {
  brand: "/#/",
  contact: "/#/kontakt",
  legal: "/#/impressum",
  bank: "/#/buchung-erfolgreich",
  pricing_auto: "/#/preise",
  pricing_auto_abos: "/#/preise",
  pricing_motorrad: "/#/preise",
  pricing_motorrad_grundkurs: "/#/preise",
  pricing_extras: "/#/preise",
  chatbot: "/#/",
  footer: "/#/",
};

const AdminContent = () => {
  const { reload } = useSiteContent();
  const [rows, setRows] = useState<Rows>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_content").select("key,value");
    if (error) toast.error("Fehler beim Laden: " + error.message);
    const map: Rows = {};
    (data ?? []).forEach((r) => { map[r.key] = r.value; });
    // Fill missing keys with defaults
    for (const k of Object.keys(DEFAULT_CONTENT)) {
      if (!(k in map)) map[k] = (DEFAULT_CONTENT as Record<string, unknown>)[k];
    }
    setRows(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (key: string) => {
    setSavingKey(key);
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, value: rows[key] as never, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error("Fehler beim Speichern: " + error.message);
    else {
      toast.success("Gespeichert – Änderungen sind sofort live");
      await reload();
    }
    setSavingKey(null);
  };

  const resetToDefault = (key: string) => {
    if (!confirm("Diesen Bereich auf Standardwerte zurücksetzen? Nicht gespeicherte Änderungen gehen verloren.")) return;
    setRows((r) => ({ ...r, [key]: (DEFAULT_CONTENT as Record<string, unknown>)[key] }));
    toast.info("Auf Default zurückgesetzt – nicht vergessen zu speichern");
  };

  const set = <K extends string>(key: K, updater: (v: unknown) => unknown) =>
    setRows((r) => ({ ...r, [key]: updater(r[key]) }));

  if (loading) return <Card><CardContent className="p-6 text-center text-muted-foreground">Laden…</CardContent></Card>;

  const SectionFooter = ({ k }: { k: string }) => (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
      <Button onClick={() => save(k)} disabled={savingKey === k} className="font-body">
        <Save className="w-4 h-4 mr-2" /> {savingKey === k ? "Speichert…" : "Speichern"}
      </Button>
      <Button type="button" variant="outline" onClick={() => resetToDefault(k)} className="font-body">
        <RotateCcw className="w-4 h-4 mr-2" /> Auf Default zurücksetzen
      </Button>
      {PREVIEW_LINKS[k] && (
        <Button type="button" variant="ghost" asChild className="font-body">
          <a href={PREVIEW_LINKS[k]} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" /> Vorschau
          </a>
        </Button>
      )}
    </div>
  );

  // helpers for typed shape
  const brand = rows.brand as typeof DEFAULT_CONTENT.brand;
  const contact = rows.contact as typeof DEFAULT_CONTENT.contact;
  const legal = rows.legal as typeof DEFAULT_CONTENT.legal;
  const bank = rows.bank as typeof DEFAULT_CONTENT.bank;
  const chatbot = rows.chatbot as typeof DEFAULT_CONTENT.chatbot;
  const footer = rows.footer as typeof DEFAULT_CONTENT.footer;

  const renderPricingList = (k: "pricing_auto" | "pricing_auto_abos" | "pricing_motorrad" | "pricing_motorrad_grundkurs", title: string) => {
    const list = (rows[k] as PricingItem[]) ?? [];
    return (
      <Card><CardContent className="p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">Wirkt auf die Preise-Seite. Änderungen sind nach dem Speichern sofort live.</p>
        {list.map((item, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_120px_2fr_auto] gap-2 items-end p-3 border border-border" style={{ borderRadius: "3px" }}>
            <div><Label className="text-xs">Bezeichnung</Label>
              <Input value={item.name} onChange={(e) => set(k, (v) => { const a=[...(v as PricingItem[])]; a[i]={...a[i],name:e.target.value}; return a; })} />
            </div>
            <div><Label className="text-xs">Preis</Label>
              <Input value={item.price} onChange={(e) => set(k, (v) => { const a=[...(v as PricingItem[])]; a[i]={...a[i],price:e.target.value}; return a; })} />
            </div>
            <div><Label className="text-xs">Notiz (optional)</Label>
              <Input value={item.note ?? ""} onChange={(e) => set(k, (v) => { const a=[...(v as PricingItem[])]; a[i]={...a[i],note:e.target.value||undefined}; return a; })} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => set(k, (v) => (v as PricingItem[]).filter((_,j)=>j!==i))}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => set(k, (v) => [...(v as PricingItem[]), { name: "Neuer Eintrag", price: "0.-" }])}>
          <Plus className="w-4 h-4 mr-2" /> Eintrag hinzufügen
        </Button>
        <SectionFooter k={k} />
      </CardContent></Card>
    );
  };

  return (
    <Tabs defaultValue="contact" className="space-y-4">
      <TabsList className="bg-muted border border-border p-1 h-auto flex-wrap gap-1">
        <TabsTrigger value="contact">Kontakt & Adresse</TabsTrigger>
        <TabsTrigger value="brand">Branding</TabsTrigger>
        <TabsTrigger value="legal">Rechtliches</TabsTrigger>
        <TabsTrigger value="bank">Bankverbindung</TabsTrigger>
        <TabsTrigger value="pricing_auto">Preise Auto</TabsTrigger>
        <TabsTrigger value="pricing_auto_abos">Auto Abos</TabsTrigger>
        <TabsTrigger value="pricing_motorrad">Preise Motorrad</TabsTrigger>
        <TabsTrigger value="pricing_motorrad_grundkurs">MGK Preise</TabsTrigger>
        <TabsTrigger value="pricing_extras">Extras (Nothelfer/VKU)</TabsTrigger>
        <TabsTrigger value="chatbot">Chatbot-Texte</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
      </TabsList>

      <TabsContent value="contact">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Kontakt & Adresse</h3>
          <p className="text-sm text-muted-foreground">Wirkt auf Header, Footer, Kontakt-Seite, Impressum, Datenschutz und WhatsApp-Button.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Telefon</Label><Input value={contact.phone} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), phone: e.target.value }))} /></div>
            <div><Label>E-Mail</Label><Input value={contact.email} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), email: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>WhatsApp-URL (z.B. https://wa.me/41XXXXXXXXX)</Label><Input value={contact.whatsappUrl} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), whatsappUrl: e.target.value }))} /></div>
            <div><Label>Adresse – Name/Bezeichnung</Label><Input value={contact.address.street} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), address: { ...(v as typeof contact).address, street: e.target.value } }))} /></div>
            <div><Label>Strasse & Nr.</Label><Input value={contact.address.detail} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), address: { ...(v as typeof contact).address, detail: e.target.value } }))} /></div>
            <div><Label>PLZ & Ort</Label><Input value={contact.address.city} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), address: { ...(v as typeof contact).address, city: e.target.value } }))} /></div>
            <div><Label>Öffnungszeiten</Label><Input value={contact.openingHours} onChange={(e) => set("contact", (v) => ({ ...(v as typeof contact), openingHours: e.target.value }))} /></div>
          </div>
          <SectionFooter k="contact" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="brand">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Branding</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={brand.name} onChange={(e) => set("brand", (v) => ({ ...(v as typeof brand), name: e.target.value }))} /></div>
            <div><Label>Tagline</Label><Input value={brand.tagline} onChange={(e) => set("brand", (v) => ({ ...(v as typeof brand), tagline: e.target.value }))} /></div>
            <div><Label>Logo-Text Haupt</Label><Input value={brand.logoText.main} onChange={(e) => set("brand", (v) => ({ ...(v as typeof brand), logoText: { ...(v as typeof brand).logoText, main: e.target.value } }))} /></div>
            <div><Label>Logo-Text Akzent</Label><Input value={brand.logoText.accent} onChange={(e) => set("brand", (v) => ({ ...(v as typeof brand), logoText: { ...(v as typeof brand).logoText, accent: e.target.value } }))} /></div>
          </div>
          <SectionFooter k="brand" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="legal">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Rechtliches (Variablen in AGB / Impressum / Datenschutz)</h3>
          <p className="text-sm text-muted-foreground">Diese Werte werden automatisch in die Rechtsseiten eingesetzt. Der Fliesstext der Paragrafen bleibt aus rechtlichen Gründen im Code.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Inhaber-Name</Label><Input value={legal.ownerName} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), ownerName: e.target.value }))} /></div>
            <div><Label>Gerichtsstand</Label><Input value={legal.jurisdiction} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), jurisdiction: e.target.value }))} /></div>
            <div><Label>Stand-Datum (z.B. „Juni 2026")</Label><Input value={legal.standDate} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), standDate: e.target.value }))} /></div>
            <div><Label>Bearbeitungsgebühr CHF</Label><Input value={legal.processingFeeChf} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), processingFeeChf: e.target.value }))} /></div>
            <div><Label>Verzugszins %</Label><Input value={legal.latePaymentInterestPct} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), latePaymentInterestPct: e.target.value }))} /></div>
            <div><Label>Stornofrist (Stunden)</Label><Input value={legal.cancellationNoticeHours} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), cancellationNoticeHours: e.target.value }))} /></div>
            <div><Label>Arztzeugnis-Frist (Tage)</Label><Input value={legal.medicalCertificateDays} onChange={(e) => set("legal", (v) => ({ ...(v as typeof legal), medicalCertificateDays: e.target.value }))} /></div>
          </div>
          <SectionFooter k="legal" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="bank">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Bankverbindung</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Kontoinhaber</Label><Input value={bank.accountHolder} onChange={(e) => set("bank", (v) => ({ ...(v as typeof bank), accountHolder: e.target.value }))} /></div>
            <div><Label>Bank</Label><Input value={bank.bank} onChange={(e) => set("bank", (v) => ({ ...(v as typeof bank), bank: e.target.value }))} /></div>
            <div><Label>IBAN</Label><Input value={bank.iban} onChange={(e) => set("bank", (v) => ({ ...(v as typeof bank), iban: e.target.value }))} /></div>
            <div><Label>BIC</Label><Input value={bank.bic} onChange={(e) => set("bank", (v) => ({ ...(v as typeof bank), bic: e.target.value }))} /></div>
          </div>
          <SectionFooter k="bank" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="pricing_auto">{renderPricingList("pricing_auto", "Preise Auto – Einzellektionen")}</TabsContent>
      <TabsContent value="pricing_auto_abos">{renderPricingList("pricing_auto_abos", "Preise Auto – Abos")}</TabsContent>
      <TabsContent value="pricing_motorrad">{renderPricingList("pricing_motorrad", "Preise Motorrad")}</TabsContent>
      <TabsContent value="pricing_motorrad_grundkurs">{renderPricingList("pricing_motorrad_grundkurs", "Preise Motorrad-Grundkurs")}</TabsContent>

      <TabsContent value="pricing_extras">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Extras (Nothelfer, VKU)</h3>
          {((rows.pricing_extras as PricingExtra[]) ?? []).map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_2fr_auto] gap-2 items-end p-3 border border-border" style={{ borderRadius: "3px" }}>
              <div><Label className="text-xs">Titel</Label>
                <Input value={item.title} onChange={(e) => set("pricing_extras", (v) => { const a=[...(v as PricingExtra[])]; a[i]={...a[i],title:e.target.value}; return a; })} />
              </div>
              <div><Label className="text-xs">Bezeichnung</Label>
                <Input value={item.name} onChange={(e) => set("pricing_extras", (v) => { const a=[...(v as PricingExtra[])]; a[i]={...a[i],name:e.target.value}; return a; })} />
              </div>
              <div><Label className="text-xs">Preis</Label>
                <Input value={item.price} onChange={(e) => set("pricing_extras", (v) => { const a=[...(v as PricingExtra[])]; a[i]={...a[i],price:e.target.value}; return a; })} />
              </div>
              <div><Label className="text-xs">Notiz</Label>
                <Input value={item.note ?? ""} onChange={(e) => set("pricing_extras", (v) => { const a=[...(v as PricingExtra[])]; a[i]={...a[i],note:e.target.value||undefined}; return a; })} />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => set("pricing_extras", (v) => (v as PricingExtra[]).filter((_,j)=>j!==i))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => set("pricing_extras", (v) => [...(v as PricingExtra[]), { title: "Neu", name: "Neuer Eintrag", price: "0.-" }])}>
            <Plus className="w-4 h-4 mr-2" /> Eintrag hinzufügen
          </Button>
          <SectionFooter k="pricing_extras" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="chatbot">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Chatbot-Texte</h3>
          <div><Label>Begrüssung</Label><Textarea rows={3} value={chatbot.welcomeMessage} onChange={(e) => set("chatbot", (v) => ({ ...(v as typeof chatbot), welcomeMessage: e.target.value }))} /></div>
          <div><Label>Grundkurs-Intro</Label><Textarea rows={4} value={chatbot.grundkursIntro} onChange={(e) => set("chatbot", (v) => ({ ...(v as typeof chatbot), grundkursIntro: e.target.value }))} /></div>
          <div><Label>Fahrstunden-Intro</Label><Textarea rows={4} value={chatbot.fahrstundenIntro} onChange={(e) => set("chatbot", (v) => ({ ...(v as typeof chatbot), fahrstundenIntro: e.target.value }))} /></div>
          <SectionFooter k="chatbot" />
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="footer">
        <Card><CardContent className="p-6 space-y-4">
          <h3 className="font-heading font-bold text-lg">Footer</h3>
          <div><Label>Copyright-Text</Label><Input value={footer.copyright} onChange={(e) => set("footer", (v) => ({ ...(v as typeof footer), copyright: e.target.value }))} /></div>
          <SectionFooter k="footer" />
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminContent;
