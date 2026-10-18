import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { isInvalidPublicSlug, shouldExcludeFromSitemap } from './app/core/utils/html-content.util';
import { shouldIncludeProductInSitemap } from './app/core/utils/product-seo.util';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'guardianpubs.com',
    'www.guardianpubs.com'
  ]
});

const API_BASE = 'https://api.guardianpubs.com/api';
const DOMAIN = 'https://www.guardianpubs.com';

function encodeSitemapPath(path: string): string {
  return path
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(segment) : ''))
    .join('/');
}

function appendSitemapUrl(
  xmlParts: string[],
  seenUrls: Set<string>,
  path: string,
  options: { changefreq?: string; priority?: string; lastmod?: string } = {}
) {
  if (!path || path.includes('?') || path.includes('#')) {
    return;
  }

  const normalizedPath = path === '' ? '' : (path.startsWith('/') ? path : `/${path}`);
  const loc = `${DOMAIN}${encodeSitemapPath(normalizedPath)}`;

  if (seenUrls.has(loc)) {
    return;
  }

  seenUrls.add(loc);
  const lastmod = options.lastmod ? `<lastmod>${options.lastmod}</lastmod>` : '';
  const changefreq = options.changefreq ? `<changefreq>${options.changefreq}</changefreq>` : '';
  const priority = options.priority ? `<priority>${options.priority}</priority>` : '';
  xmlParts.push(`<url><loc>${loc}</loc>${lastmod}${changefreq}${priority}</url>`);
}

/**
 * Security headers and canonical domain redirect
 */
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  const host = req.get('host');
  if (host === 'guardianpubs.com') {
    return res.redirect(301, `${DOMAIN}${req.originalUrl}`);
  }

  if (/^\/author\/--/.test(req.path) || /^\/product-details\/--/.test(req.path) || /^\/special-package\/--/.test(req.path)) {
    return res.redirect(301, '/');
  }

  next();
});

/**
 * Dynamic Sitemap Route
 */
app.get('/sitemap.xml', async (req, res) => {
  try {
    const staticUrls = [
      '',
      '/product-list',
      '/author-list',
      '/category-list',
      '/blogs',
      '/offers',
      '/special-package',
      '/activities',
      '/manuscript-submission',
      '/contact-us',
      '/find-book-location',
      '/all-video',
      '/pages/about-us',
      '/pages/delivery-policy',
      '/pages/how-to-order-website',
      '/pages/return-and-refund-policy',
      '/pages/terms-and-conditions',
      '/pages/manuscript-terms',
    ];

    // Fetch Dynamic Data in Parallel
    const [productsRes, authorsRes, blogsRes, activitiesRes, packagesRes] = await Promise.all([
      fetch(`${API_BASE}/product/get-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
      }).then(r => r.json()),
      fetch(`${API_BASE}/author/get-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
      }).then(r => r.json()),
      fetch(`${API_BASE}/blog/get-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
      }).then(r => r.json()),
      fetch(`${API_BASE}/activities/get-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
      }).then(r => r.json()),
      fetch(`${API_BASE}/special-package/get-all/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: null, select: { slug: 1, updatedAt: 1 }, pagination: null })
      }).then(r => r.json())
    ]);

    const xmlParts: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
    ];
    const seenUrls = new Set<string>();

    // Static URLs
    staticUrls.forEach((url) => {
      appendSitemapUrl(xmlParts, seenUrls, url, { changefreq: 'daily', priority: '0.8' });
    });

    const formatLastMod = (value?: string) =>
      value ? new Date(value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Product URLs — canonical only (excludes 2nd/3rd parts, invalid slugs)
    if (productsRes.success) {
      productsRes.data.forEach((p: any) => {
        if (!shouldExcludeFromSitemap(p.slug) && shouldIncludeProductInSitemap(p.slug)) {
          appendSitemapUrl(xmlParts, seenUrls, `/product-details/${p.slug}`, {
            lastmod: formatLastMod(p.updatedAt),
            changefreq: 'weekly',
            priority: '0.9'
          });
        }
      });
    }

    // Author URLs
    if (authorsRes.success) {
      authorsRes.data.forEach((a: any) => {
        if (!isInvalidPublicSlug(a.slug)) {
          appendSitemapUrl(xmlParts, seenUrls, `/author/${a.slug}`, { changefreq: 'weekly', priority: '0.7' });
        }
      });
    }

    // Blog URLs
    if (blogsRes.success) {
      blogsRes.data.forEach((b: any) => {
        if (!isInvalidPublicSlug(b.slug)) {
          appendSitemapUrl(xmlParts, seenUrls, `/blog/${b.slug}`, {
            lastmod: formatLastMod(b.updatedAt),
            changefreq: 'weekly',
            priority: '0.6'
          });
        }
      });
    }

    // Activity URLs
    if (activitiesRes.success) {
      activitiesRes.data.forEach((act: any) => {
        if (!isInvalidPublicSlug(act.slug)) {
          appendSitemapUrl(xmlParts, seenUrls, `/activities/${act.slug}`, {
            lastmod: formatLastMod(act.updatedAt),
            changefreq: 'weekly',
            priority: '0.6'
          });
        }
      });
    }

    // Special Package URLs
    if (packagesRes.success) {
      packagesRes.data.forEach((pkg: any) => {
        if (!isInvalidPublicSlug(pkg.slug)) {
          appendSitemapUrl(xmlParts, seenUrls, `/special-package/${pkg.slug}`, {
            lastmod: formatLastMod(pkg.updatedAt),
            changefreq: 'weekly',
            priority: '0.7'
          });
        }
      });
    }

    xmlParts.push(`</urlset>`);
    const xml = xmlParts.join('');

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap Error:', error);
    res.status(500).send('Error generating sitemap');
  }
});


/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 7000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 7000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
