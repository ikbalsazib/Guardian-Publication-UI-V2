import { absoluteUrl } from '../schema.config';
import { CollectionItemInput, SchemaNode } from '../schema.types';

export function buildCollectionPageGraph(
  canonicalPath: string,
  title: string,
  items: CollectionItemInput[]
): SchemaNode[] {
  const canonicalUrl = absoluteUrl(canonicalPath);

  return [
    {
      '@type': 'CollectionPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: item.url.startsWith('http') ? item.url : absoluteUrl(item.url),
        })),
      },
    },
  ];
}
