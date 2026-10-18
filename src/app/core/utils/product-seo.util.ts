/** Known multi-volume pairs from SEO audit (slug → canonical 1st-part slug). */
const EXPLICIT_CANONICAL_SLUGS: Record<string, string> = {
  'usulul-iman-2nd-part': 'usulul-iman-1st-part',
};

const MULTI_PART_SLUG = /^(.+)-(1st|2nd|3rd|4th|first|second|third|fourth)-part$/i;

const PART_LABELS: Record<string, string> = {
  '1st': '১ম খণ্ড',
  '2nd': '২য় খণ্ড',
  '3rd': '৩য় খণ্ড',
  '4th': '৪র্থ খণ্ড',
  first: '১ম খণ্ড',
  second: '২য় খণ্ড',
  third: '৩য় খণ্ড',
  fourth: '৪র্থ খণ্ড',
};

export interface BookPartInfo {
  baseSlug: string;
  partKey: string;
  isFirstPart: boolean;
  partLabelBn: string;
}

export function getBookPartInfo(slug?: string | null): BookPartInfo | null {
  if (!slug) return null;

  const match = slug.match(MULTI_PART_SLUG);
  if (!match) return null;

  const partKey = match[2].toLowerCase();
  const isFirstPart = partKey === '1st' || partKey === 'first';

  return {
    baseSlug: match[1],
    partKey,
    isFirstPart,
    partLabelBn: PART_LABELS[partKey] || partKey,
  };
}

/**
 * For multi-part books, later parts canonicalize to the 1st part (per SEO audit).
 * Part 1 and non-series products keep their own URL as canonical.
 */
export function getProductCanonicalPath(slug?: string | null): string {
  if (!slug) return '';

  if (EXPLICIT_CANONICAL_SLUGS[slug]) {
    return `/product-details/${EXPLICIT_CANONICAL_SLUGS[slug]}`;
  }

  const partInfo = getBookPartInfo(slug);
  if (partInfo && !partInfo.isFirstPart) {
    return `/product-details/${partInfo.baseSlug}-1st-part`;
  }

  return `/product-details/${slug}`;
}

const SCHEMA_BASE_URL = 'https://www.guardianpubs.com';

/** Full HTTPS canonical URL for JSON-LD @id/url fields. */
export function getProductCanonicalUrl(slug?: string | null): string {
  const path = getProductCanonicalPath(slug);
  return path ? `${SCHEMA_BASE_URL}${path}` : SCHEMA_BASE_URL;
}

/** Only canonical product URLs belong in the sitemap. */
export function shouldIncludeProductInSitemap(slug?: string | null): boolean {
  if (!slug?.trim()) {
    return false;
  }

  const canonical = getProductCanonicalPath(slug);
  return canonical === `/product-details/${slug}`;
}

export function buildProductMetaDescription(
  bookTitle: string,
  authorName: string,
  slug?: string | null,
  cmsDescription?: string
): string {
  if (cmsDescription?.trim()) {
    return cmsDescription.trim();
  }

  const partInfo = getBookPartInfo(slug);
  const partSuffix = partInfo ? ` (${partInfo.partLabelBn})` : '';

  return `${bookTitle}${partSuffix}${authorName ? ` - ${authorName}` : ''} | Guardian Publications থেকে কিনুন।`;
}
