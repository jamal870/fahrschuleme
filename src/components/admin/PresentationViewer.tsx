import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Film } from "lucide-react";
import { getEmbedUrl, type SlideVideo } from "@/lib/presentation-videos";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

type Props = {
  url: string;
  title: string;
  onClose: () => void;
  videos?: SlideVideo[];
  /** Löst einen Storage-Pfad in eine abspielbare URL auf */
  resolveVideoSrc?: (path: string) => Promise<string | null>;
};

const PresentationViewer = ({ url, title, onClose, videos = [], resolveVideoSrc }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState<{ src: string; title: string; embed: boolean } | null>(null);

  const slideVideos = useMemo(() => videos.filter((v) => v.slide === page), [videos, page]);

  const openVideo = async (v: SlideVideo) => {
    if (v.url) {
      const embed = getEmbedUrl(v.url);
      setPlaying({ src: embed ?? v.url, title: v.title ?? "Video", embed: !!embed });
      return;
    }
    if (v.path && resolveVideoSrc) {
      const src = await resolveVideoSrc(v.path);
      if (src) setPlaying({ src, title: v.title ?? "Video", embed: false });
    }
  };


  useEffect(() => {
    let cancelled = false;
    const task = pdfjsLib.getDocument({ url });
    task.promise
      .then((doc) => {
        if (cancelled) return;
        docRef.current = doc;
        setTotal(doc.numPages);
        setPage(1);
      })
      .catch((e) => setError(e?.message ?? "PDF konnte nicht geladen werden"));
    return () => {
      cancelled = true;
      task.destroy?.();
    };
  }, [url]);

  const render = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!doc || !canvas || !container) return;
    const pdfPage = await doc.getPage(page);
    const base = pdfPage.getViewport({ scale: 1 });
    const scale = Math.min(
      container.clientWidth / base.width,
      container.clientHeight / base.height,
    );
    const viewport = pdfPage.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${base.width * scale}px`;
    canvas.style.height = `${base.height * scale}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;
  }, [page]);

  useEffect(() => {
    render();
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [render, total]);

  const next = useCallback(() => setPage((p) => Math.min(p + 1, total || 1)), [total]);
  const prev = useCallback(() => setPage((p) => Math.max(p - 1, 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (playing) {
        if (e.key === "Escape") { e.preventDefault(); setPlaying(null); }
        return;
      }
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose, playing]);


  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <span className="font-heading font-bold truncate">{title}</span>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground whitespace-nowrap">
            {total ? `${page} / ${total}` : "…"}
          </span>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label="Vollbild">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Schliessen">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 flex items-center justify-center p-2 bg-muted/40 relative">
        {error ? (
          <p className="font-body text-destructive text-center px-6">{error}</p>
        ) : (
          <canvas ref={canvasRef} className="shadow-elegant" style={{ borderRadius: "3px" }} />
        )}

        {!playing && slideVideos.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 px-3">
            {slideVideos.map((v, i) => (
              <Button key={i} size="sm" onClick={() => openVideo(v)} className="font-body sheen shadow-elegant">
                <Film className="w-4 h-4 mr-1" /> {v.title || `Video ${i + 1}`}
              </Button>
            ))}
          </div>
        )}

        {playing && (
          <div className="absolute inset-0 bg-black flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="font-heading font-bold text-white truncate">{playing.title}</span>
              <Button variant="ghost" size="icon" onClick={() => setPlaying(null)} aria-label="Video schliessen">
                <X className="w-4 h-4 text-white" />
              </Button>
            </div>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {playing.embed ? (
                <iframe
                  src={playing.src}
                  title={playing.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video src={playing.src} controls autoPlay className="max-w-full max-h-full" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-border">
        <Button variant="outline" onClick={prev} disabled={page <= 1} className="font-body">
          <ChevronLeft className="w-4 h-4 mr-1" /> Zurück
        </Button>
        <Button onClick={next} disabled={!total || page >= total} className="font-body">
          Weiter <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PresentationViewer;

