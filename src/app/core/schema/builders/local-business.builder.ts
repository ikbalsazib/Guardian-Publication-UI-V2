import { SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';
import { buildOrganizationNode } from './organization.builder';

export function buildLocalBusinessNode(imageUrl?: string): SchemaNode {
  return {
    '@type': SCHEMA_CONFIG.localBusinessType,
    '@id': SCHEMA_CONFIG.localBusinessId,
    name: SCHEMA_CONFIG.name,
    url: `${SCHEMA_CONFIG.baseUrl}/`,
    ...(imageUrl ? { image: imageUrl } : { image: SCHEMA_CONFIG.logo }),
    parentOrganization: { '@id': SCHEMA_CONFIG.organizationId },
    telephone: SCHEMA_CONFIG.phones[0],
    email: SCHEMA_CONFIG.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SCHEMA_CONFIG.address.streetAddress,
      addressLocality: SCHEMA_CONFIG.address.addressLocality,
      postalCode: SCHEMA_CONFIG.address.postalCode,
      addressCountry: SCHEMA_CONFIG.address.addressCountry,
    },
    sameAs: [...SCHEMA_CONFIG.sameAs],
  };
}

export function buildContactPageGraph(imageUrl?: string): SchemaNode[] {
  return [
    {
      '@type': 'ContactPage',
      '@id': `${SCHEMA_CONFIG.baseUrl}/contact-us#webpage`,
      url: `${SCHEMA_CONFIG.baseUrl}/contact-us`,
      name: 'যোগাযোগ',
      isPartOf: { '@id': SCHEMA_CONFIG.websiteId },
      about: { '@id': SCHEMA_CONFIG.localBusinessId },
    },
    buildLocalBusinessNode(imageUrl),
  ];
}

export function buildAboutPageGraph(pageUrl: string, pageName: string): SchemaNode[] {
  return [
    {
      '@type': 'AboutPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName,
      isPartOf: { '@id': SCHEMA_CONFIG.websiteId },
      about: { '@id': SCHEMA_CONFIG.organizationId },
      mainEntity: { '@id': SCHEMA_CONFIG.localBusinessId },
    },
    buildOrganizationNode(),
    buildLocalBusinessNode(),
  ];
}
