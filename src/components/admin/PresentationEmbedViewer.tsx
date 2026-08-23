import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";

type Props = {
  url: string;
  title: string;
  onClose: () => void;
};

/**
 * Vollbild-Anzeige einer Google-Präsentation im Original-Player:
 * Animationen, Übergänge und eingebettete Videos funktionieren 1:1.
 */
const PresentationEmbedViewer = ({ url, title, onClose }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border">
        <h2 className="font-heading font-bold truncate">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="font-body"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4 mr-1" /> Neuer Tab
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="font-body">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <iframe
        src={url}
        title={title}
        className="flex-1 w-full border-0 bg-black"
        allow="autoplay; fullscreen; encrypted-media"
        allowFullScreen
      />
    </div>
  );
};

export default PresentationEmbedViewer;
