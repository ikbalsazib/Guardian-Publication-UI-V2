import { Activities } from '../../../interfaces/common/activities.interface';
import { absoluteUrl, SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';
import { stripHtml } from '../../utils/html-content.util';
import { toAbsoluteHttpsUrl } from '../utils/to-absolute-url';

function toIsoDate(value?: Date | string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export function buildActivityArticleNode(activity: Activities): SchemaNode {
  const canonicalUrl = absoluteUrl(`/activities/${activity.slug}`);
  const image = toAbsoluteHttpsUrl(activity.image);
  const datePublished = toIsoDate(activity.createdAt);
  const dateModified = toIsoDate(activity.updatedAt || activity.createdAt);

  const node: SchemaNode = {
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: activity.name || '',
    description: stripHtml(activity.shortDesc || activity.description || activity.name || ''),
    inLanguage: 'bn-BD',
    publisher: { '@id': SCHEMA_CONFIG.organizationId },
  };

  if (image) {
    node['image'] = [image];
  }

  if (datePublished) {
    node['datePublished'] = datePublished;
  }

  if (dateModified) {
    node['dateModified'] = dateModified;
  }

  if (activity.authorName?.trim()) {
    node['author'] = {
      '@type': 'Person',
      name: activity.authorName.trim(),
    };
  }

  return node;
}
