import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CanonicalService } from './canonical.service';
import { SchemaService } from '../../core/schema/schema.service';
import { BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb.component';
import { Product } from '../../interfaces/common/product';
import { Blog } from '../../interfaces/common/blog.interface';
import { Author } from '../../interfaces/common/author.interface';
import { ShopInformation } from '../../interfaces/common/shop-information.interface';
import { SpecialPackage } from '../../interfaces/common/special-package.interface';
import { Activities } from '../../interfaces/common/activities.interface';
import { getProductCanonicalPath } from '../../core/utils/product-seo.util';
import { buildHomepageGraph } from '../../core/schema/builders/organization.builder';
import { buildAboutPageGraph, buildContactPageGraph } from '../../core/schema/builders/local-business.builder';
import { buildBreadcrumbList, buildBreadcrumbOnlyGraph } from '../../core/schema/builders/breadcrumb.builder';
import { buildProductNode, buildSpecialPackageProductNode } from '../../core/schema/builders/product.builder';
import { buildBlogPostingNode } from '../../core/schema/builders/article.builder';
import { buildActivityArticleNode } from '../../core/schema/builders/activity.builder';
import { buildAuthorGraph } from '../../core/schema/builders/author.builder';
import { buildCollectionPageGraph } from '../../core/schema/builders/collection.builder';
import { buildWebPageGraph } from '../../core/schema/builders/web-page.builder';
import { absoluteUrl, SCHEMA_CONFIG } from '../../core/schema/schema.config';
import { CollectionItemInput, SchemaNode } from '../../core/schema/schema.types';
import { toAbsoluteHttpsUrl } from '../../core/schema/utils/to-absolute-url';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly router = inject(Router);
  private readonly document: Document = inject(DOCUMENT);
  private readonly schemaService = inject(SchemaService);

  /**
   * Sets the SEO metadata for a page.
   */
  updateMetaData(data: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
    url?: string;
    author?: string;
    authorName?: string;
    titleType?: 'default' | 'book';
    isHome?: boolean;
    noIndex?: boolean;
    canonicalPath?: string;
  }) {
    const siteName = 'Guardian Publications';
    const siteDescription = 'Guardian Publications is a leading publisher in Bangladesh, specializing in Islamic, Academic and Literature books.';
    const currentPath = this.router.url.split('?')[0];
    const canonicalPath = data.canonicalPath || currentPath;
    const maxTotalTitleLen = 65;
    const siteSuffix = ` | ${siteName}`;

    // 1. Title Management
    let finalTitle = '';
    if (data.isHome) {
      finalTitle = `${siteName} | Quality Books for Quality Readers`;
    } else if (data.title) {
      if (data.titleType === 'book' && data.authorName) {
        const authorPart = ` | ${data.authorName}`;
        const availableForBook = maxTotalTitleLen - authorPart.length - siteSuffix.length;
        let bookTitle = data.title;
        if (bookTitle.length > availableForBook) {
          bookTitle = bookTitle.substring(0, Math.max(availableForBook, 10)).replace(/\s+\S*$/, '') + '…';
        }
        finalTitle = `${bookTitle}${authorPart}${siteSuffix}`;
      } else {
        const maxPageTitleLen = maxTotalTitleLen - siteSuffix.length;
        let pageTitle = data.title;
        if (pageTitle.length > maxPageTitleLen) {
          pageTitle = pageTitle.substring(0, maxPageTitleLen).replace(/\s+\S*$/, '') + '…';
        }
        finalTitle = `${pageTitle}${siteSuffix}`;
      }
    } else {
      finalTitle = siteName;
    }
    // 1. Language Tag Management
    const lang = this.router.url.includes('language=en') ? 'en' : 'bn';
    this.document.documentElement.setAttribute('lang', lang);

    this.title.setTitle(finalTitle);

    // 2. Canonical URL
    this.canonicalService.setCanonicalURL(canonicalPath);

    // 3. Basic Meta Tags
    const rawDesc = data.description || siteDescription;
    const finalDesc = rawDesc.length > 160 ? rawDesc.substring(0, 157).replace(/\s+\S*$/, '') + '…' : rawDesc;
    this.meta.updateTag({ name: 'description', content: finalDesc });
    this.meta.updateTag({ name: 'keywords', content: data.keywords || 'Guardian Publications, Bangla Books, Islamic Books, Bangladesh, Buy Books' });
    this.meta.updateTag({ name: 'author', content: data.author || siteName });

    // 4. Open Graph
    this.meta.updateTag({ property: 'og:title', content: finalTitle });
    this.meta.updateTag({ property: 'og:description', content: finalDesc });
    this.meta.updateTag({ property: 'og:url', content: `https://www.guardianpubs.com${canonicalPath}` });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    this.meta.updateTag({ property: 'og:type', content: data.type || (data.isHome ? 'website' : 'book') });

    let finalImage = data.image || `https://www.guardianpubs.com/images/logo/logo-share.png`;
    if (finalImage.startsWith('/')) {
      finalImage = `https://www.guardianpubs.com${finalImage}`;
    }
    this.meta.updateTag({ property: 'og:image', content: finalImage });

    // 5. Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: finalTitle });
    this.meta.updateTag({ name: 'twitter:description', content: finalDesc });
    this.meta.updateTag({ name: 'twitter:image', content: finalImage });

    // 6. Robots logic
    if (data.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  clearSchema(): void {
    this.schemaService.clearSchema();
  }

  setHomepageSchema(): void {
    this.schemaService.setGraph(buildHomepageGraph());
  }

  setProductSchema(product: Product, breadcrumbs: BreadcrumbItem[]): void {
    const canonicalPath = getProductCanonicalPath(product.slug);
    const canonicalUrl = absoluteUrl(canonicalPath);
    const nodes: SchemaNode[] = [
      buildProductNode(product),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ];
    this.schemaService.setGraph(nodes);
  }

  /** @deprecated Use setProductSchema instead */
  setBookSchema(book: Product): void {
    this.setProductSchema(book, []);
  }

  setBlogSchema(blog: Blog, breadcrumbs: BreadcrumbItem[]): void {
    const canonicalUrl = absoluteUrl(`/blog/${blog.slug}`);
    this.schemaService.setGraph([
      buildBlogPostingNode(blog),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ]);
  }

  setActivitySchema(activity: Activities, breadcrumbs: BreadcrumbItem[]): void {
    const canonicalUrl = absoluteUrl(`/activities/${activity.slug}`);
    this.schemaService.setGraph([
      buildActivityArticleNode(activity),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ]);
  }

  setContactSchema(shopInfo?: ShopInformation | null, breadcrumbs: BreadcrumbItem[] = []): void {
    const imageUrl = toAbsoluteHttpsUrl(shopInfo?.siteLogo || shopInfo?.footerLogo || SCHEMA_CONFIG.logo);
    const canonicalUrl = absoluteUrl('/contact-us');
    const nodes: SchemaNode[] = [
      ...buildContactPageGraph(imageUrl),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ];
    this.schemaService.setGraph(nodes);
  }

  setAboutSchema(pageTitle: string, breadcrumbs: BreadcrumbItem[] = []): void {
    const pageUrl = absoluteUrl('/pages/about-us');
    const nodes: SchemaNode[] = [
      ...buildAboutPageGraph(pageUrl, pageTitle),
      buildBreadcrumbList(pageUrl, breadcrumbs),
    ];
    this.schemaService.setGraph(nodes);
  }

  setWebPageSchema(canonicalPath: string, pageTitle: string, breadcrumbs: BreadcrumbItem[] = []): void {
    const canonicalUrl = absoluteUrl(canonicalPath);
    this.schemaService.setGraph([
      ...buildWebPageGraph(canonicalPath, pageTitle),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ]);
  }

  setBreadcrumbSchema(canonicalPath: string, breadcrumbs: BreadcrumbItem[]): void {
    this.schemaService.setGraph(buildBreadcrumbOnlyGraph(absoluteUrl(canonicalPath), breadcrumbs));
  }

  setAuthorSchema(author: Author, breadcrumbs: BreadcrumbItem[]): void {
    const canonicalUrl = absoluteUrl(`/author/${author.slug}`);
    this.schemaService.setGraph([
      ...buildAuthorGraph(author),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ]);
  }

  setSpecialPackageSchema(pkg: SpecialPackage, breadcrumbs: BreadcrumbItem[]): void {
    const canonicalUrl = absoluteUrl(`/special-package/${pkg.slug}`);
    this.schemaService.setGraph([
      buildSpecialPackageProductNode(pkg),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ]);
  }

  setCollectionSchema(
    canonicalPath: string,
    title: string,
    items: CollectionItemInput[],
    breadcrumbs: BreadcrumbItem[] = []
  ): void {
    const canonicalUrl = absoluteUrl(canonicalPath);
    const nodes: SchemaNode[] = [
      ...buildCollectionPageGraph(canonicalPath, title, items),
      buildBreadcrumbList(canonicalUrl, breadcrumbs),
    ];
    this.schemaService.setGraph(nodes);
  }
}
