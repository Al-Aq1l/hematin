// ponytail: lookup table untuk warna default seed; kategori custom user jatuh ke fallback hue-shift. Upgrade saat user bikin banyak kategori custom dan paletnya nabrak.
const MAP: Record<string, string> = {
  "#F97316": "#FF9F6E", // Food → peach
  "#3B82F6": "#7FB4F0", // Transportation → sky
  "#EC4899": "#F2A0C4", // Shopping → pink
  "#8B5CF6": "#B7A6F0", // Entertainment → lavender
  "#EF4444": "#F08A82", // Bills → coral red
  "#10B981": "#7ED3AE", // Education/Emerald → mint
  "#06B6D4": "#8AD4DE", // Health → aqua
  "#6B7280": "#9AA0A8", // Other → grey
  "#F59E0B": "#F5C57B", // Gift → amber sand
};

export function categoryColor(hex?: string | null): string {
  if (!hex) return "#9AA0A8";
  const key = hex.toUpperCase();
  if (MAP[key]) return MAP[key];
  // desaturate ~35% + lightness floor
  const r = parseInt(key.slice(1, 3), 16);
  const g = parseInt(key.slice(3, 5), 16);
  const b = parseInt(key.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c + (200 - c) * 0.35);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

