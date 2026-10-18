import { Product } from '../../../interfaces/common/product';
import { getProductCanonicalPath } from '../../utils/product-seo.util';
import { stripHtml } from '../../utils/html-content.util';
import { absoluteUrl, SCHEMA_CONFIG } from '../schema.config';
import { SchemaNode } from '../schema.types';
import { mapProductAvailability } from '../utils/availability-mapper';
import { mapBookFormat } from '../utils/book-format-mapper';
import { getVisibleSalePrice } from '../utils/product-price.util';
import { toAbsoluteHttpsUrl, toAbsoluteHttpsUrls } from '../utils/to-absolute-url';

function resolveAuthors(product: Product): SchemaNode[] {
  const rawAuthors = product.author
    ? (Array.isArray(product.author) ? product.author : [product.author])
    : [];

  return rawAuthors
    .filter((author) => author?.name)
    .map((author) => {
      const authorUrl = author.slug ? absoluteUrl(`/author/${author.slug}`) : undefined;
      const node: SchemaNode = {
        '@type': 'Person',
        name: author.name,
      };

      if (authorUrl) {
        node['@id'] = `${authorUrl}#person`;
        node['url'] = authorUrl;
      }

      return node;
    });
}

function resolveAggregateRating(product: Product): SchemaNode | undefined {
  const reviewCount = product.ratingTotal ?? 0;
  const ratingSum = product.ratingCount ?? 0;

  if (reviewCount <= 0 || ratingSum <= 0) {
    return undefined;
  }

  const ratingValue = (ratingSum / reviewCount).toFixed(1);

  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount: String(reviewCount),
    bestRating: '5',
    worstRating: '1',
  };
}

function isValidIsbn(isbn?: string | null): boolean {
  if (!isbn?.trim()) {
    return false;
  }

  const normalized = isbn.trim().toLowerCase();
  return normalized !== 'n/a' && normalized !== 'na' && normalized !== '-' && normalized !== '00' && normalized !== '0';
}

export function buildProductNode(product: Product): SchemaNode {
  const canonicalPath = getProductCanonicalPath(product.slug);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const authors = resolveAuthors(product);
  const images = toAbsoluteHttpsUrls(product.images);
  const image = images.length ? images : undefined;
  const bookFormat = mapBookFormat(product.bindType);
  const aggregateRating = resolveAggregateRating(product);

  const node: SchemaNode = {
    '@type': ['Product', 'Book'],
    '@id': `${canonicalUrl}#product`,
    url: canonicalUrl,
    name: product.name,
    description: stripHtml(product.seoDescription || product.shortDescription || product.description || product.name),
    sku: String(product.sku || product._id || ''),
    publisher: { '@id': SCHEMA_CONFIG.organizationId },
    brand: { '@id': SCHEMA_CONFIG.organizationId },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: String(getVisibleSalePrice(product)),
      priceCurrency: 'BDT',
      availability: mapProductAvailability(product.quantity, product.status),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': SCHEMA_CONFIG.organizationId },
    },
  };

  if (image) {
    node['image'] = image.length === 1 ? image[0] : image;
  }

  if (product.category?.name) {
    node['category'] = product.category.name;
  }

  if (authors.length === 1) {
    node['author'] = authors[0];
  } else if (authors.length > 1) {
    node['author'] = authors;
  }

  if (isValidIsbn(product.isbn)) {
    node['isbn'] = product.isbn!.trim();
  }

  if (bookFormat) {
    node['bookFormat'] = bookFormat;
  }

  if (aggregateRating) {
    node['aggregateRating'] = aggregateRating;
  }

  return node;
}

export function buildSpecialPackageProductNode(pkg: {
  name?: string;
  slug?: string;
  seoDescription?: string;
  description?: string;
  image?: string;
  salePrice?: number;
  _id?: string;
  quantity?: number;
  status?: string;
}): SchemaNode {
  const canonicalUrl = absoluteUrl(`/special-package/${pkg.slug}`);
  const image = toAbsoluteHttpsUrl(pkg.image);

  const node: SchemaNode = {
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    url: canonicalUrl,
    name: pkg.name || '',
    description: stripHtml(pkg.seoDescription || pkg.description || pkg.name || ''),
    sku: String(pkg._id || pkg.slug || ''),
    brand: { '@id': SCHEMA_CONFIG.organizationId },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      price: String(pkg.salePrice ?? 0),
      priceCurrency: 'BDT',
      availability: mapProductAvailability(pkg.quantity ?? 1, pkg.status),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': SCHEMA_CONFIG.organizationId },
    },
  };

  if (image) {
    node['image'] = image;
  }

  return node;
}
