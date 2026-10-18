#!/usr/bin/env node
/**
 * Structural validation of JSON-LD for Rich Results readiness (local substitute when tunnel unavailable).
 */
const BASE = process.env.BASE_URL || 'http://localhost:7001';

const URLS = [
  '/',
  '/product-details/ami-jani-tumi-mithya-bolcho',
  '/product-list',
  '/blog/the-mistake-that-led-to-saddam-hussein-s-downfall',
  '/contact-us',
  '/pages/about-us',
  '/offers',
];

async function getGraph(path) {
  const html = await (await fetch(`${BASE}${path}`)).text();
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return { path, error: 'NO_JSON_LD', issues: ['Missing application/ld+json in SSR HTML'] };
  try {
    const j = JSON.parse(m[1]);
    return { path, graph: j['@graph'] || [j], issues: [] };
  } catch {
    return { path, error: 'PARSE', issues: ['Invalid JSON in ld+json block'] };
  }
}

function validate(path, graph) {
  const issues = [];
  const types = graph.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));

  for (const node of graph) {
    if (node['@type'] === 'Product' || (Array.isArray(node['@type']) && node['@type'].includes('Product'))) {
      if (!node.name) issues.push('Product missing name');
      if (!node.offers?.price) issues.push('Product missing offers.price');
      if (node.offers?.priceCurrency !== 'BDT') issues.push('Product priceCurrency should be BDT');
      if (!node.offers?.availability) issues.push('Product missing offers.availability');
      if (node.isbn === '' || node.isbn === '00') issues.push('Product has empty/invalid isbn');
      if (node.aggregateRating && !(node.aggregateRating.reviewCount > 0)) {
        issues.push('aggregateRating without reviews');
      }
    }
    if (node['@type'] === 'BlogPosting') {
      if (!node.headline && !node.name) issues.push('BlogPosting missing headline/name');
      if (!node.datePublished) issues.push('BlogPosting missing datePublished');
    }
    if (node['@type'] === 'CollectionPage' && types.includes('Product')) {
      issues.push('CollectionPage graph must not include Product nodes');
    }
  }

  const serialized = JSON.stringify(graph);
  if (serialized.includes('<')) issues.push('Unescaped < in JSON-LD');

  return issues;
}

async function main() {
  console.log(`External-style validation — ${BASE}\n`);
  let critical = 0;

  for (const path of URLS) {
    const result = await getGraph(path);
    if (result.error) {
      console.log(`FAIL ${path}: ${result.issues.join('; ')}`);
      critical += result.issues.length;
      continue;
    }
    const issues = validate(path, result.graph);
    if (issues.length) {
      console.log(`WARN ${path}:`);
      issues.forEach((i) => console.log(`  - ${i}`));
      critical += issues.length;
    } else {
      console.log(`PASS ${path} — ${result.graph.length} nodes, no structural issues`);
    }
  }

  console.log(`\nCritical issues: ${critical}`);
  process.exit(critical > 0 ? 1 : 0);
}

main();
