const BROKEN_EXTERNAL_LINKS: [RegExp, string][] = [
  [/https?:\/\/(?:www\.)?daily-sangram\.com/gi, 'https://dailysangram.com'],
  [/https?:\/\/www\.dailysangram\.com/gi, 'https://dailysangram.com'],
  [/http:\/\/dailysangram\.com/gi, 'https://dailysangram.com'],
];

const INTERNAL_LINK_NORMALIZATIONS: [RegExp, string][] = [
  [/https?:\/\/guardianpubs\.com/gi, 'https://www.guardianpubs.com'],
];

/** Blocks only clearly broken slugs (e.g. SEO audit junk URLs like `--70`). */
export function isInvalidPublicSlug(slug?: string | null): boolean {
  if (!slug || !slug.trim()) {
    return true;
  }

  return slug.trim().startsWith('--');
}

/** Stricter filter for sitemap entries only (keeps junk multi-dash product URLs out). */
export function shouldExcludeFromSitemap(slug?: string | null): boolean {
  if (!slug || !slug.trim()) {
    return true;
  }

  const normalized = slug.trim();
  return normalized.startsWith('--') || normalized.includes('--');
}

export function normalizeCmsHtml(html: string): string {
  if (!html) return html;

  let result = html
    .replace(/<\s*h1\b/gi, '<h2')
    .replace(/<\s*\/\s*h1\s*>/gi, '</h2>');

  for (const [pattern, replacement] of BROKEN_EXTERNAL_LINKS) {
    result = result.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of INTERNAL_LINK_NORMALIZATIONS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/** @deprecated Use normalizeCmsHtml */
export function fixBrokenExternalLinks(html: string): string {
  return normalizeCmsHtml(html);
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function countWords(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}
