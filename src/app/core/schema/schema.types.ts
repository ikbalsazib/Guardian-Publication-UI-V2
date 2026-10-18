export type SchemaNode = Record<string, unknown>;

export interface SchemaGraph {
  '@context': 'https://schema.org';
  '@graph': SchemaNode[];
}

export interface BreadcrumbInput {
  label: string;
  url?: string;
  isCurrent?: boolean;
}

export interface CollectionItemInput {
  url: string;
}
