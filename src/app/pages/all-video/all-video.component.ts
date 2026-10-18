import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YoutubeVideo } from '../../interfaces/common/youtube-video.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { YoutubeVideoService } from '../../services/common/youtube-video.service';
import { SeoService } from '../../services/core/seo.service';


@Component({
  selector: 'app-all-video',
  templateUrl: './all-video.component.html',
  styleUrls: ['./all-video.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class AllVideoComponent implements OnInit, OnDestroy {
  // Signals
  videos = signal<YoutubeVideo[]>([]);
  isLoading = signal<boolean>(false);
  isLoadMore = signal<boolean>(false);
  totalVideos = signal<number>(0);

  // Pagination
  currentPage = 1;
  pageSize = 6;

  // Dependencies
  private videoService = inject(YoutubeVideoService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.updateMetaData({
      title: this.translateService.instant('ln.VideoGallery'),
      description: this.translateService.instant('ln.VideoGallerySubtitle'),
      canonicalPath: '/all-video',
    });
    this.seoService.setBreadcrumbSchema('/all-video', [
      { label: this.translateService.instant('ln.VideoGallery'), isCurrent: true },
    ]);
    this.fetchVideos();
  }

  fetchVideos(isLoadMore: boolean = false) {
    const filter: FilterData = {
      filter: null,
      select: { name: 1, title: 1, url: 1, createdAt: 1 },
      sort: { createdAt: -1 },
      pagination: { pageSize: this.pageSize, currentPage: this.currentPage - 1 }
    };

    if (isLoadMore) {
      this.isLoadMore.set(true);
    } else {
      this.isLoading.set(true);
    }

    const sub = this.videoService.getAllYoutubeVideo(filter, null).subscribe({
      next: (res) => {
        if (isLoadMore) {
          this.videos.update(prev => [...prev, ...res.data]);
        } else {
          this.videos.set(res.data);
        }
        this.totalVideos.set(res.count);
        this.updateCollectionSchema();
        this.isLoading.set(false);
        this.isLoadMore.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.isLoadMore.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  onLoadMore() {
    if (this.videos().length < this.totalVideos()) {
      this.currentPage++;
      this.fetchVideos(true);
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  private updateCollectionSchema() {
    const items = this.videos()
      .filter((video) => video.url)
      .map((video) => ({ url: video.url! }));

    if (!items.length) {
      return;
    }

    this.seoService.setCollectionSchema(
      '/all-video',
      this.translateService.instant('ln.VideoGallery'),
      items,
      [{ label: this.translateService.instant('ln.VideoGallery'), isCurrent: true }]
    );
  }

  private extractVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
