import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpecialPackage } from '../../interfaces/common/special-package.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { SeoPageService } from '../../services/common/seo-page.service';
import { SpecialPackagesService } from '../../services/common/special-packages.service';
import { SpecialPackageCardOneComponent } from '../../shared/components/special-package-card-one/special-package-card-one.component';
import { SeoService } from '../../services/core/seo.service';



@Component({
  selector: 'app-special-package-list',
  templateUrl: './special-package-list.component.html',
  styleUrls: ['./special-package-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    SpecialPackageCardOneComponent
  ]
})
export class SpecialPackageListComponent implements OnInit, OnDestroy {
  // Signals
  packages = signal<SpecialPackage[]>([]);
  isLoading = signal<boolean>(false);
  totalProjects = signal<number>(0);

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(12);

  // Dependencies
  private specialPackageService = inject(SpecialPackagesService);
  private seoPageService = inject(SeoPageService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.fetchPackages();
    this.fetchSeoData();
  }

  private fetchPackages() {
    const filter: FilterData = {
      select: { name: 1, image: 1, slug: 1, description: 1 },
      filter: null,
      sort: { createdAt: -1 },
      pagination: null
    };

    this.isLoading.set(true);
    const sub = this.specialPackageService.getAllSpecialPackages(filter).subscribe({
      next: (res) => {
        this.packages.set(res.data);
        this.totalProjects.set(res.count);
        this.updateCollectionSchema();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  private fetchSeoData() {
    const sub = this.seoPageService.getSeoPageByPageWithCache('special-package', 'name image seoDescription keyWord pageName').subscribe(res => {
      if (res) {
        this.seoService.updateMetaData({
          title: res.name || 'Special Packages',
          description: res.seoDescription || '',
          keywords: res.keyWord,
          image: res.image,
          canonicalPath: '/special-package',
        });
        this.seoService.setBreadcrumbSchema('/special-package', [
          { label: res.name || this.translate.instant('ln.SpecialPackage'), isCurrent: true },
        ]);
      }
    });
    this.subscriptions.push(sub);
  }

  private updateCollectionSchema() {
    const items = this.packages()
      .filter((pkg) => pkg.slug)
      .map((pkg) => ({ url: `/special-package/${pkg.slug}` }));

    if (!items.length) {
      return;
    }

    this.seoService.setCollectionSchema(
      '/special-package',
      this.translate.instant('ln.SpecialPackage'),
      items,
      [{ label: this.translate.instant('ln.SpecialPackage'), isCurrent: true }]
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
