export function slugToTitle(slug: string): string {
  if (!slug) return "";
  return slug
    ?.split(/[-_]/gi)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}
