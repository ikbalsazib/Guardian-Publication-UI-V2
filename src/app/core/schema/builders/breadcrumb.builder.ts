import { BreadcrumbItem } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { absoluteUrl, SCHEMA_CONFIG } from '../schema.config';
import { BreadcrumbInput, SchemaNode } from '../schema.types';

export function buildBreadcrumbList(
  canonicalUrl: string,
  items: BreadcrumbInput[] | BreadcrumbItem[]
): SchemaNode {
  const listItems: SchemaNode[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'মূলপাতা',
      item: `${SCHEMA_CONFIG.baseUrl}/`,
    },
  ];

  items.forEach((item, index) => {
    const position = index + 2;
    const listItem: SchemaNode = {
      '@type': 'ListItem',
      position,
      name: item.label,
    };

    if (item.url && !item.isCurrent) {
      listItem['item'] = absoluteUrl(item.url);
    }

    listItems.push(listItem);
  });

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: listItems,
  };
}

export function buildBreadcrumbOnlyGraph(
  canonicalUrl: string,
  items: BreadcrumbInput[] | BreadcrumbItem[]
): SchemaNode[] {
  return [buildBreadcrumbList(canonicalUrl, items)];
}
