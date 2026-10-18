import { describe, expect, it } from 'vitest';
import { buildBreadcrumbList } from './builders/breadcrumb.builder';
import { buildProductNode } from './builders/product.builder';
import { mapProductAvailability } from './utils/availability-mapper';
import { getVisibleSalePrice } from './utils/product-price.util';
import { parseJsonLd, serializeJsonLd } from './utils/schema-serializer';

describe('Schema builders', () => {
  it('serializes JSON-LD safely', () => {
    const serialized = serializeJsonLd({ name: '<script>alert(1)</script>' });
    expect(serialized).not.toContain('<script>');
    expect(parseJsonLd(serialized)).toEqual({ name: '<script>alert(1)</script>' });
  });

  it('omits empty ISBN from product schema', () => {
    const schema = buildProductNode({
      name: 'Test Book',
      slug: 'test-book',
      salePrice: 280,
      quantity: 5,
      isbn: '',
    });

    expect(schema['isbn']).toBeUndefined();
    expect(schema['@type']).toEqual(['Product', 'Book']);
    expect((schema['offers'] as Record<string, string>).price).toBe('280');
    expect((schema['offers'] as Record<string, string>).priceCurrency).toBe('BDT');
  });

  it('includes aggregateRating only when reviews exist', () => {
    const withReviews = buildProductNode({
      name: 'Rated Book',
      slug: 'rated-book',
      salePrice: 100,
      quantity: 1,
      ratingTotal: 10,
      ratingCount: 47,
    });

    expect(withReviews['aggregateRating']).toEqual({
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '10',
      bestRating: '5',
      worstRating: '1',
    });

    const withoutReviews = buildProductNode({
      name: 'Unrated Book',
      slug: 'unrated-book',
      salePrice: 100,
      quantity: 1,
      ratingTotal: 0,
      ratingCount: 0,
    });

    expect(withoutReviews['aggregateRating']).toBeUndefined();
  });

  it('maps availability from quantity', () => {
    expect(mapProductAvailability(5)).toBe('https://schema.org/InStock');
    expect(mapProductAvailability(0)).toBe('https://schema.org/OutOfStock');
    expect(mapProductAvailability(0, 'preorder')).toBe('https://schema.org/PreOrder');
  });

  it('uses discounted visible price in product schema', () => {
    const schema = buildProductNode({
      name: 'Discounted Book',
      slug: 'discounted-book',
      salePrice: 500,
      discountAmount: 10,
      discountType: 1,
      quantity: 3,
    });

    expect((schema['offers'] as Record<string, string>).price).toBe('450');
  });

  it('builds breadcrumb list with home as first item', () => {
    const breadcrumb = buildBreadcrumbList('https://www.guardianpubs.com/product-list', [
      { label: 'সকল বই', url: '/product-list' },
    ]);

    const items = breadcrumb['itemListElement'] as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]['name']).toBe('মূলপাতা');
    expect(items[1]['name']).toBe('সকল বই');
  });
});
