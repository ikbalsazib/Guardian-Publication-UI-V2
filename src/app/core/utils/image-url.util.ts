export function optimizeHeroImageUrl(url?: string | null, mobile = false): string {
  if (!url) {
    return '';
  }

  const size = mobile ? '768_256' : '1200_400';
  const [base] = url.split('?');
  return `${base}?resolution=${size}`;
}

export function pickHeroImage(carousel?: { image?: string; mobileImage?: string }, mobile = false): string {
  if (!carousel) {
    return '';
  }

  const source = mobile && carousel.mobileImage ? carousel.mobileImage : carousel.image;
  return optimizeHeroImageUrl(source, mobile);
}

export function injectHeroPreloadLinks(
  document: Document,
  imageUrl?: string,
  mobileImageUrl?: string
): void {
  const mobileHref = optimizeHeroImageUrl(mobileImageUrl || imageUrl, true);
  const desktopHref = optimizeHeroImageUrl(imageUrl, false);

  if (mobileHref) {
    addHeroPreloadLink(document, mobileHref, 'mobile', '(max-width: 730px)', 'high');
  }
  if (desktopHref) {
    addHeroPreloadLink(document, desktopHref, 'desktop', '(min-width: 731px)', 'low');
  }
}

function addHeroPreloadLink(
  document: Document,
  href: string,
  key: string,
  media: string,
  fetchPriority: 'high' | 'low'
): void {
  if (document.querySelector(`link[data-preload-hero="${key}"]`)) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = href;
  link.media = media;
  link.setAttribute('fetchpriority', fetchPriority);
  link.setAttribute('data-preload-hero', key);
  document.head.appendChild(link);
}
