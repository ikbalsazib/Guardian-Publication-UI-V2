import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ActivitiesService } from '../../../services/common/activities.service';
import { Activities } from '../../../interfaces/common/activities.interface';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { ActivitiesCardOneComponent } from '../../../shared/components/activities-card-one/activities-card-one.component';
import { BlogLoaderComponent } from '../../../shared/skeleton-loader/blog-loader/blog-loader.component';
import { SeoService } from '../../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../../shared/components/seo-internal-links/seo-internal-links.component';

@Component({
  selector: 'app-all-activities',
  templateUrl: './all-activities.component.html',
  styleUrls: ['./all-activities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    ActivitiesCardOneComponent,
    BlogLoaderComponent,
    SeoInternalLinksComponent
  ]
})
export class AllActivitiesComponent implements OnInit, OnDestroy {
  // Signals
  activities = signal<Activities[]>([]);
  isLoading = signal<boolean>(false);
  
  // Pagination
  currentPage = signal<number>(1);
  totalItems = signal<number>(0);
  itemsPerPage = 12;

  // Dependencies
  private readonly activitiesService = inject(ActivitiesService);
  private readonly seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.updateMetaData({
      title: 'কার্যক্রম',
      description: 'Guardian Publications-এর বইমেলা, সেমিনার, লোকপ্রিয় ইভেন্ট ও প্রকাশনা সংক্রান্ত সাম্প্রতিক কার্যক্রম দেখুন।',
      canonicalPath: '/activities',
    });
    this.seoService.setBreadcrumbSchema('/activities', [
      { label: 'কার্যক্রম', isCurrent: true },
    ]);
    this.fetchActivities();
  }

  private fetchActivities() {
    const filter: FilterData = {
      filter: null,
      select: { name: 1, shortDesc: 1, image: 1, authorName: 1, totalView: 1, createdAt: 1, slug: 1 },
      sort: { createdAt: -1 },
      pagination: { pageSize: this.itemsPerPage, currentPage: this.currentPage() - 1 }
    };

    this.isLoading.set(true);
    const sub = this.activitiesService.getAllActivities(filter, undefined).subscribe({
      next: (res: any) => {
        this.activities.set(res.data || []);
        this.totalItems.set(res.count || 0);
        this.updateCollectionSchema();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  onPageChanged(event: number) {
    this.currentPage.set(event);
    this.fetchActivities();
  }

  private updateCollectionSchema() {
    const items = this.activities()
      .filter((activity) => activity.slug)
      .map((activity) => ({ url: `/activities/${activity.slug}` }));

    if (!items.length) {
      return;
    }

    this.seoService.setCollectionSchema(
      '/activities',
      'কার্যক্রম',
      items,
      [{ label: 'কার্যক্রম', isCurrent: true }]
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
