import { SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';

export function buildOrganizationNode(): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': SCHEMA_CONFIG.organizationId,
    name: SCHEMA_CONFIG.name,
    alternateName: SCHEMA_CONFIG.alternateName,
    url: `${SCHEMA_CONFIG.baseUrl}/`,
    foundingDate: SCHEMA_CONFIG.foundingDate,
    description: SCHEMA_CONFIG.description,
    logo: {
      '@type': 'ImageObject',
      url: SCHEMA_CONFIG.logo,
    },
    email: `mailto:${SCHEMA_CONFIG.email}`,
    telephone: SCHEMA_CONFIG.phones[0],
    contactPoint: [
      ...SCHEMA_CONFIG.phones.map((phone) => ({
        '@type': 'ContactPoint',
        telephone: phone,
        contactType: 'customer service',
        areaServed: 'BD',
        availableLanguage: ['bn', 'en'],
      })),
      {
        '@type': 'ContactPoint',
        telephone: SCHEMA_CONFIG.landline,
        contactType: 'customer service',
        areaServed: 'BD',
        availableLanguage: ['bn', 'en'],
      },
    ],
    sameAs: [...SCHEMA_CONFIG.sameAs],
  };
}

export function buildWebSiteNode(): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': SCHEMA_CONFIG.websiteId,
    url: `${SCHEMA_CONFIG.baseUrl}/`,
    name: SCHEMA_CONFIG.name,
    inLanguage: [...SCHEMA_CONFIG.inLanguage],
    publisher: { '@id': SCHEMA_CONFIG.organizationId },
  };
}

export function buildHomepageGraph(): SchemaNode[] {
  return [buildWebSiteNode(), buildOrganizationNode()];
}

export function buildOrganizationReferenceGraph(): SchemaNode[] {
  return [buildOrganizationNode()];
}
