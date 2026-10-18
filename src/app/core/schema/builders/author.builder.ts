import { Author } from '../../../interfaces/common/author.interface';
import { absoluteUrl, SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';
import { stripHtml } from '../../utils/html-content.util';
import { toAbsoluteHttpsUrl } from '../utils/to-absolute-url';

export function buildAuthorGraph(author: Author): SchemaNode[] {
  const authorUrl = absoluteUrl(`/author/${author.slug}`);
  const image = toAbsoluteHttpsUrl(author.image);
  const description = stripHtml(author.description || author.descriptionEn || '');

  const person: SchemaNode = {
    '@type': 'Person',
    '@id': `${authorUrl}#person`,
    name: author.name || author.nameEn || '',
    url: authorUrl,
  };

  if (image) {
    person['image'] = image;
  }

  if (description) {
    person['description'] = description;
  }

  return [
    {
      '@type': 'ProfilePage',
      '@id': `${authorUrl}#profilepage`,
      url: authorUrl,
      name: author.name || author.nameEn || '',
      mainEntity: { '@id': `${authorUrl}#person` },
      isPartOf: { '@id': SCHEMA_CONFIG.websiteId },
    },
    person,
  ];
}
