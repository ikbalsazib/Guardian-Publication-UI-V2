import { absoluteUrl } from '../schema.config';

export function toAbsoluteHttpsUrl(url?: string | null): string | undefined {
  if (!url?.trim()) {
    return undefined;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }
  return absoluteUrl(trimmed);
}

export function toAbsoluteHttpsUrls(urls?: (string | null | undefined)[]): string[] {
  if (!urls?.length) {
    return [];
  }
  return urls
    .map((url) => toAbsoluteHttpsUrl(url))
    .filter((url): url is string => Boolean(url));
}
