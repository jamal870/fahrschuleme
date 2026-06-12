import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  initial?: string | null;
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}

const SignaturePad = ({ initial, onSave, onCancel }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(!initial);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (initial) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = initial;
    }
  }, [initial]);

  const pos = (e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e as PointerEvent).clientX - rect.left, y: (e as PointerEvent).clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    setEmpty(false);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setEmpty(true);
  };

  const save = () => {
    if (empty) return;
    const data = canvasRef.current!.toDataURL("image/png");
    onSave(data);
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-border bg-white" style={{ borderRadius: "3px" }}>
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="w-full touch-none cursor-crosshair block"
          style={{ height: "220px" }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-body">Mit Finger oder Maus im weißen Feld unterschreiben.</p>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={clear} className="font-body">
          <Eraser className="w-4 h-4 mr-1" /> Leeren
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="font-body">Abbrechen</Button>
        )}
        <Button size="sm" onClick={save} disabled={empty} className="font-body">
          <Check className="w-4 h-4 mr-1" /> Übernehmen
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
