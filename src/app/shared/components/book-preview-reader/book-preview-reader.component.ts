import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cart } from '../../../interfaces/common/cart.interface';
import { Author } from '../../../interfaces/common/author.interface';
import { Product } from '../../../interfaces/common/product';
import { CartService } from '../../../services/common/cart.service';
import { UserService } from '../../../services/common/user.service';
import { ProductService } from '../../../services/common/product.service';
import { ReloadService } from '../../../services/core/reload.service';
import { UiService } from '../../../services/core/ui.service';
import { PricePipe } from '../../pipes/price.pipe';

export interface BookPreviewReaderData {
  product: Product;
}

@Component({
  selector: 'app-book-preview-reader',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule, PricePipe],
  templateUrl: './book-preview-reader.component.html',
  styleUrls: ['./book-preview-reader.component.scss'],
})
export class BookPreviewReaderComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<BookPreviewReaderComponent>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly breakpointObserver = inject(BreakpointObserver);
  readonly isMobile = toSignal(
    this.breakpointObserver.observe(['(max-width: 1070px)']).pipe(
      map((state) => state.matches),
    ),
    {
      initialValue:
        isPlatformBrowser(this.platformId) &&
        window.matchMedia('(max-width: 1070px)').matches,
    },
  );
  private readonly cartService = inject(CartService);
  private readonly userService = inject(UserService);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  readonly translateService = inject(TranslateService);
  readonly data = inject<BookPreviewReaderData>(MAT_DIALOG_DATA);

  private pageObserver?: IntersectionObserver;
  private readonly subscriptions: Subscription[] = [];
  private readonly scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  readonly currentPage = signal(1);
  readonly failedPages = signal<Set<number>>(new Set());
  readonly carts = signal<Cart[]>([]);
  readonly zoomLevel = signal<number>(100);

  zoomIn() {
    this.zoomLevel.update(v => Math.min(v + 25, 200));
  }

  zoomOut() {
    this.zoomLevel.update(v => Math.max(v - 25, 50));
  }

  readonly _product = signal<Product>(this.data.product);
  readonly product = computed(() => this._product());
  readonly previewImages = computed(() => {
    const pdfUrl = this.pdfUrl();
    return (this.product().previewImages ?? []).map((imageUrl) =>
      this.normalizePreviewImageUrl(imageUrl, pdfUrl),
    );
  });
  readonly hasPreviewImages = computed(() => this.previewImages().length > 0);
  readonly totalPages = computed(() => this.previewImages().length);
  readonly pdfUrl = computed(
    () => this.product().pdfUrl || this.product().pdfFile || '',
  );
  readonly cart = computed(() =>
    this.carts().find((item) => (item.product as any)?._id === this.product()._id),
  );
  readonly coverImage = computed(
    () =>
      this.product().images?.[0] || '/images/placeholder/test.png',
  );
  readonly hasDiscount = computed(() => {
    const product = this.product();
    return (
      (product.discountAmount ?? 0) > 0 ||
      (product.offerDiscountAmount ?? 0) > 0
    );
  });
  readonly numberLocale = computed(() =>
    this.translateService.currentLang === 'bn' ? 'bn' : 'en',
  );

  readonly displayTitle = computed(() => {
    const product = this.product();
    const isEn = this.translateService.currentLang === 'en';
    return isEn ? product.nameEn || product.name : product.name;
  });

  readonly displayAuthors = computed(() => {
    const authors = this.product().author ?? [];
    const isEn = this.translateService.currentLang === 'en';
    return authors
      .slice(0, 2)
      .map((author: Author) => (isEn ? author?.nameEn || author?.name : author?.name) || author?.name)
      .filter(Boolean)
      .join(', ');
  });

  constructor() {
    afterNextRender(() => {
      this.initPageObserver();
    });
  }

  ngOnInit() {
    this.carts.set(this.cartService.cartItems);

    this.subscriptions.push(
      this.cartService.refreshStoredCart$.subscribe(() => {
        this.carts.set(this.cartService.cartItems);
      }),
    );

    // Fetch full product details if preview is missing (useful when opened from a landing page where populate is missing)
    if (!this.hasPreviewImages() && !this.pdfUrl() && this.product().slug) {
      this.subscriptions.push(
        this.productService.getProductBySlug(this.product().slug as string).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this._product.set({ ...this._product(), ...res.data });
              setTimeout(() => this.initPageObserver(), 100);
            }
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.pageObserver?.disconnect();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  close() {
    this.dialogRef.close();
  }

  onImageError(pageNumber: number) {
    this.failedPages.update((pages) => {
      const next = new Set(pages);
      next.add(pageNumber);
      return next;
    });
  }

  isPageFailed(pageNumber: number): boolean {
    return this.failedPages().has(pageNumber);
  }

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();

    if (this.cart()) {
      this.close();
      this.router.navigate(['/cart']);
      return;
    }

    const data: Cart = {
      product: this.product()._id,
      selectedQty: 1,
    };

    if (this.userService.getUserStatus()) {
      const sub = this.cartService.addToCart(data).subscribe({
        next: (res) => {
          this.uiService.success(res.message);
          this.reloadService.needRefreshCart$(true);
        },
        error: (err) => console.log(err),
      });
      this.subscriptions.push(sub);
      return;
    }

    this.cartService.addCartItemToLocalStorage(data);
    this.reloadService.needRefreshCart$(true);
  }

  openFullPdf() {
    const url = this.pdfUrl();
    if (url && isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  private initPageObserver() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.pageObserver?.disconnect();

    const root = this.scrollContainer()?.nativeElement;
    if (!root) {
      return;
    }

    const pageItems = root.querySelectorAll<HTMLElement>('.page-item');
    if (!pageItems.length) {
      return;
    }

    this.pageObserver = new IntersectionObserver(
      (entries) => {
        let bestPage = this.currentPage();
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const page = Number(entry.target.getAttribute('data-page'));
          if (page && entry.intersectionRatio >= bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestPage = page;
          }
        }

        if (bestRatio > 0) {
          this.currentPage.set(bestPage);
        }
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    pageItems.forEach((item) => this.pageObserver?.observe(item));
  }

  private normalizePreviewImageUrl(imageUrl: string, pdfUrl: string): string {
    if (!imageUrl) {
      return imageUrl;
    }

    const fileName = imageUrl.split('/upload/images/')[1]?.split('?')[0];
    if (!fileName) {
      return imageUrl;
    }

    const apiBase =
      this.deriveApiBaseFromPdfUrl(pdfUrl) ||
      `${environment.ftpBaseLink}/api`;

    return `${apiBase.replace(/\/$/, '')}/upload/images/${fileName}`;
  }

  private deriveApiBaseFromPdfUrl(pdfUrl: string): string | null {
    if (!pdfUrl) {
      return null;
    }

    try {
      const parsed = new URL(pdfUrl);
      const apiIndex = parsed.pathname.indexOf('/api');
      if (apiIndex >= 0) {
        return `${parsed.origin}${parsed.pathname.substring(0, apiIndex + 4)}`;
      }

      return `${parsed.origin}/api`;
    } catch (error) {
      return null;
    }
  }
}
