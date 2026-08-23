/**
 * Wandelt einen Google-Drive-/Google-Slides-Link in eine einbettbare URL um.
 * Damit läuft die Präsentation 1:1 im Original-Player von Google –
 * inkl. Animationen, Übergängen und eingebetteten Videos.
 */
export const toEmbedUrl = (raw: string): string | null => {
  const url = raw.trim();
  if (!url) return null;

  // Native Google Slides: .../presentation/d/<id>/edit
  const slides = url.match(/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slides) {
    return `https://docs.google.com/presentation/d/${slides[1]}/embed?start=false&loop=false&rm=minimal`;
  }

  // Hochgeladene PPTX in Drive: .../file/d/<id>/view
  const file = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (file) {
    return `https://drive.google.com/file/d/${file[1]}/preview`;
  }

  // open?id=<id>
  const open = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (open) {
    return `https://drive.google.com/file/d/${open[1]}/preview`;
  }

  // Bereits eine Embed-URL
  if (/^https:\/\/(docs|drive)\.google\.com\//.test(url)) return url;

  return null;
};
