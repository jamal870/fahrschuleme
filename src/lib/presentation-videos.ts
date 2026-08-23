export type SlideVideo = {
  /** 1-basierte Foliennummer */
  slide: number;
  title?: string;
  /** Externe URL (YouTube, Vimeo, direkter MP4-Link) */
  url?: string;
  /** Pfad im Storage-Bucket "presentations" */
  path?: string;
};

export const parseVideos = (raw: unknown): SlideVideo[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is SlideVideo => !!v && typeof v === "object")
    .map((v) => ({
      slide: Number(v.slide) || 1,
      title: v.title || undefined,
      url: v.url || undefined,
      path: v.path || undefined,
    }))
    .sort((a, b) => a.slide - b.slide);
};

/** Liefert eine Embed-URL für YouTube/Vimeo, sonst null (dann <video> nutzen). */
export const getEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  } catch {
    return null;
  }
  return null;
};
