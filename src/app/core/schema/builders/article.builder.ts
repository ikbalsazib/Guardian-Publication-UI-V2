import { Blog } from '../../../interfaces/common/blog.interface';
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

export function buildBlogPostingNode(blog: Blog): SchemaNode {
  const canonicalUrl = absoluteUrl(`/blog/${blog.slug}`);
  const image = toAbsoluteHttpsUrl(blog.image);
  const datePublished = toIsoDate(blog.createdAt);
  const dateModified = toIsoDate(blog.updatedAt || blog.createdAt);

  const node: SchemaNode = {
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#article`,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: blog.name || blog.seoTitle || '',
    description: stripHtml(blog.seoDescription || blog.shortDesc || blog.description || blog.name || ''),
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

  if (blog.authorName?.trim()) {
    node['author'] = {
      '@type': 'Person',
      name: blog.authorName.trim(),
    };
  }

  return node;
}
