// Fonts for social preview cards (next/og). Its built-in font has no Cyrillic, and event
// names often do — so the card asks Google Fonts for exactly the glyphs it draws: a subset of
// a few kilobytes (the same families the site uses, via next/font). Server only.

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal";
}

/**
 * The family subset to `text`, or null when Google Fonts can't be reached — the card is then
 * drawn with the built-in font instead of failing. A server fetch (no browser user agent)
 * gets TrueType, which next/og reads; responses are cached.
 */
export async function googleFont(family: string, weight: OgFont["weight"], text: string): Promise<OgFont | null> {
  try {
    const query = `family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(5_000),
    }).then((res) => (res.ok ? res.text() : ""));
    const url = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const data = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(5_000) }).then((res) =>
      res.ok ? res.arrayBuffer() : null,
    );
    return data ? { name: family, data, weight, style: "normal" } : null;
  } catch {
    return null;
  }
}

/** Every glyph a card will draw, once each — the smaller the subset, the faster the card */
export const glyphs = (...parts: string[]) => [...new Set(parts.join(""))].join("");
