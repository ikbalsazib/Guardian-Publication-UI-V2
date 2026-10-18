#!/usr/bin/env node
/**
 * Local JSON-LD QA script — run against SSR server (default http://localhost:7001).
 */
const BASE = process.env.BASE_URL || 'http://localhost:7001';

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, html: await res.text() };
}

function extractLdJson(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

function parseGraph(blocks) {
  const nodes = [];
  for (const raw of blocks) {
    try {
      const j = JSON.parse(raw);
      if (j['@graph']) nodes.push(...j['@graph']);
      else nodes.push(j);
    } catch {
      return { error: 'PARSE_ERR', nodes: [] };
    }
  }
  return { nodes };
}

function typesOf(nodes) {
  return nodes.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']])).filter(Boolean);
}

function hasType(nodes, t) {
  return typesOf(nodes).includes(t);
}

function hasNestedOffer(nodes) {
  return nodes.some((n) => n.offers?.['@type'] === 'Offer');
}

async function check(path, expectedTypes, opts = {}) {
  const { html, status } = await fetchHtml(path);
  const blocks = extractLdJson(html);
  const { nodes, error } = parseGraph(blocks);
  const types = typesOf(nodes);
  const pass =
    !error &&
    (opts.allowEmpty ? true : blocks.length > 0) &&
    expectedTypes.every((t) => {
      if (t === 'Offer') return hasNestedOffer(nodes);
      return hasType(nodes, t);
    }) &&
    (!opts.mustNotHave || !opts.mustNotHave.some((t) => hasType(nodes, t)));

  console.log(`\n${pass ? 'PASS' : 'FAIL'} ${path} (HTTP ${status})`);
  console.log(`  ld+json blocks: ${blocks.length}`);
  console.log(`  types: ${types.join(', ') || '(none)'}`);
  console.log(`  expected: ${expectedTypes.join(', ')}`);
  if (opts.mustNotHave?.length) {
    console.log(`  must NOT have: ${opts.mustNotHave.join(', ')}`);
  }
  return { pass, nodes, html, blocks };
}

async function parityCheck(slug) {
  const path = `/product-details/${slug}`;
  const { html, nodes } = await check(path, ['Product', 'Book', 'Offer', 'BreadcrumbList']);
  if (!nodes.length) return;

  const product = nodes.find((n) => {
    const t = n['@type'];
    return (Array.isArray(t) ? t : [t]).includes('Product');
  });
  const offer = product?.offers;
  const price = offer?.price;
  const currency = offer?.priceCurrency;
  const availability = offer?.availability;
  const isbn = product?.isbn;
  const rating = product?.aggregateRating;

  const priceMatch = html.match(/৳\s*([\d,]+)/);
  const visiblePrice = priceMatch ? priceMatch[1].replace(/,/g, '') : null;

  const inStockText = /in stock|স্টকে/i.test(html);
  const outStockText = /out of stock|স্টক নেই/i.test(html);

  console.log('\n--- Parity: ' + slug + ' ---');
  console.log(`  schema price: ${price} ${currency}`);
  console.log(`  visible price (first ৳): ${visiblePrice ?? 'N/A'}`);
  console.log(`  schema availability: ${availability}`);
  console.log(`  page stock hint: in=${inStockText} out=${outStockText}`);
  console.log(`  isbn in schema: ${isbn !== undefined ? JSON.stringify(isbn) : '(omitted)'}`);
  console.log(`  aggregateRating: ${rating !== undefined ? JSON.stringify(rating) : '(omitted)'}`);

  if (visiblePrice && price != null) {
    const match = String(price) === visiblePrice || String(price) === Number(visiblePrice).toFixed(2);
    console.log(`  price parity: ${match ? 'OK' : 'MISMATCH'}`);
  }
}

async function main() {
  console.log(`Schema QA — ${BASE}`);

  const results = [];
  results.push(await check('/', ['WebSite', 'Organization']));
  results.push(
    await check('/product-details/ami-jani-tumi-mithya-bolcho', [
      'Product',
      'Book',
      'Offer',
      'BreadcrumbList',
    ])
  );
  results.push(await check('/product-list', ['CollectionPage', 'BreadcrumbList'], { mustNotHave: ['Product'] }));
  results.push(
    await check('/contact-us', ['ContactPage', 'LocalBusiness', 'BreadcrumbList'])
  );
  results.push(
    await check('/pages/about-us', ['AboutPage', 'Organization', 'LocalBusiness', 'BreadcrumbList'])
  );
  results.push(await check('/offers', ['CollectionPage', 'BreadcrumbList'], { mustNotHave: ['Product'] }));

  const invalidProduct = await check('/product-details/invalid-slug-xyz-404', [], {
    mustNotHave: ['Product'],
    allowEmpty: true,
  });
  results.push({
    pass: !hasType(invalidProduct.nodes, 'Product'),
    ...invalidProduct,
  });
  console.log(`${invalidProduct.nodes.length === 0 || !hasType(invalidProduct.nodes, 'Product') ? 'PASS' : 'FAIL'} invalid product — no Product schema`);

  const invalidBlog = await fetchHtml('/blog/invalid-blog-slug-xyz');
  const invalidBlogNodes = parseGraph(extractLdJson(invalidBlog.html)).nodes;
  const blogOk = !hasType(invalidBlogNodes, 'BlogPosting');
  console.log(`\n${blogOk ? 'PASS' : 'FAIL'} /blog/invalid-blog-slug-xyz — no BlogPosting`);
  results.push({ pass: blogOk });

  const sitemapRes = await fetch(`${BASE}/sitemap.xml`);
  const sitemap = await sitemapRes.text();
  const blogMatch = sitemap.match(/\/blog\/([^<]+)/);
  if (blogMatch) {
    results.push(await check(`/blog/${blogMatch[1]}`, ['BlogPosting', 'BreadcrumbList']));
  }

  await parityCheck('ami-jani-tumi-mithya-bolcho');
  await parityCheck('utthhaner-pothe-bangladesh');
  await parityCheck('lost-history-');

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n=== Summary: ${passed}/${total} checks passed ===`);

  // Write sample JSON-LD for external validator handoff
  const homeBlocks = extractLdJson((await fetchHtml('/')).html);
  if (homeBlocks[0]) {
    const fs = await import('node:fs');
    const outDir = new URL('../qa-output/', import.meta.url);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(new URL('homepage-schema.json', outDir), homeBlocks[0]);
    console.log('Wrote qa-output/homepage-schema.json');
  }

  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
