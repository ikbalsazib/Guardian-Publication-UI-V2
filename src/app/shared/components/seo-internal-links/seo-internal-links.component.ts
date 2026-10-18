import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-seo-internal-links',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  template: `
    <nav class="seo-internal-links" aria-label="Related pages">
      <a routerLink="/product-list">{{ 'ln.AllBooks' | translate }}</a>
      <a routerLink="/author-list">{{ 'ln.AuthorList' | translate }}</a>
      <a routerLink="/category-list">{{ 'ln.Category' | translate }}</a>
      <a routerLink="/blogs">{{ 'ln.Blog' | translate }}</a>
      <a routerLink="/activities">{{ 'ln.Activities' | translate }}</a>
      <a routerLink="/offers">{{ 'ln.Offers' | translate }}</a>
      <a routerLink="/special-package">{{ 'ln.SpecialPackage' | translate }}</a>
      <a routerLink="/pages/delivery-policy">{{ 'ln.DeliveryPolicy' | translate }}</a>
      <a routerLink="/contact-us">{{ 'ln.ContactUs' | translate }}</a>
    </nav>
  `,
  styles: [`
    .seo-internal-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 24px 0;
    }

    .seo-internal-links a {
      color: #c82027;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 8px 14px;
      border: 1px solid rgba(200, 32, 39, 0.2);
      border-radius: 999px;
      background: #fff;
    }

    .seo-internal-links a:hover {
      background: rgba(200, 32, 39, 0.05);
    }
  `]
})
export class SeoInternalLinksComponent {}
