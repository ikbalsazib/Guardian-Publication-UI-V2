import { absoluteUrl, SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';

export function buildWebPageGraph(canonicalPath: string, title: string): SchemaNode[] {
  const canonicalUrl = absoluteUrl(canonicalPath);

  return [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      isPartOf: { '@id': SCHEMA_CONFIG.websiteId },
    },
  ];
}
