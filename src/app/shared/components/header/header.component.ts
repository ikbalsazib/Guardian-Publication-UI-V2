import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CartSlideComponent } from './cart-slide/cart-slide.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { CategorySlideComponent } from './category-slide/category-slide.component';
import { MaterialModule } from '../../../material/material.module';
import { ReloadService } from '../../../services/core/reload.service';
import { EMPTY, Subscription, debounceTime, distinctUntilChanged, pluck, switchMap } from 'rxjs';
import { CartService } from '../../../services/common/cart.service';
import { Cart } from '../../../interfaces/common/cart.interface';
import { WishList } from '../../../interfaces/common/wish-list.interface';
import { WishListService } from '../../../services/common/wish-list.service';
import { Author } from '../../../interfaces/common/author.interface';
import { Product } from '../../../interfaces/common/product';
import { UtilsService } from '../../../services/core/utils.service';
import { CURRENCY } from '../../../core/utils/app-data';
import { Currency } from '../../../interfaces/core/currency.interface';
import { AuthorService } from '../../../services/common/author.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';
import { Pagination } from '../../../interfaces/core/pagination';
import { ProductService } from '../../../services/common/product.service';
import { UserService } from '../../../services/common/user.service';
import { UserDataService } from "../../../services/common/user-data.service";
import { NotificationService } from "../../../services/common/notification.service";
import { User } from "../../../interfaces/common/user.interface";
import { PricePipe } from '../../pipes/price.pipe';
import { EngBnNumPipe } from '../../pipes/eng-bn-num.pipe';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CartSlideComponent,
    SideNavComponent,
    CategorySlideComponent,
    MaterialModule,
    PricePipe
  ],
  providers: [PricePipe]
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Signals
  headerFixed = signal<boolean>(false);
  showMegaMenu = signal<boolean>(false);
  private lastScrollY = 0;
  isUser = signal<boolean>(false);
  carts = signal<Cart[]>([]);
  cartBadgeCount = computed(() =>
    this.carts().reduce((sum, item) => sum + (item.selectedQty || 0), 0)
  );
  wishlists = signal<WishList[]>([]);
  notificationsCount = signal<number>(0);
  searchProducts = signal<Product[]>([]);
  isOpen = signal<boolean>(false);
  overlay = signal<boolean>(false);
  isFocused = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isLoadingAuthor = signal<boolean>(false);
  user = signal<User | null>(null);
  compareItemsCount = signal<number>(0);

  isCheckoutPage(): boolean {
    return this.router.url.includes('/checkout') ||
      this.router.url.includes('/product-details/') ||
      this.router.url.includes('/special-package/') ||
      this.router.url.includes('/landing-page/') ||
      this.router.url.includes('/landing-page-2/') ||
      this.router.url.includes('/promotion/');
  }

  // Store data
  authors: Author[] = [];
  shopInfo = signal<any>(null);
  isChangeLanguage = signal<boolean>(true);
  isChangeLanguageToggle = signal<string>('bn');
  currency: Currency = CURRENCY;
  searchQuery: string | null = null;
  selectedIndex: number = -1;

  // Search Placeholder Animation
  timeOutOngoing: any;
  char = 0;
  txt = ['পছন্দের বই খুঁজুন - প্রোডাক্টিভ মুসলিম...', 'লেখকের নাম দিয়ে খুঁজুন - ইউসুফ আল কারজাভি...'];
  indicator = 0;

  // View Childs
  @ViewChild('side_nav') side_nav!: SideNavComponent;
  @ViewChild('cart_slide') cart_slide!: CartSlideComponent;
  @ViewChild('category_slide') category_slide!: CategorySlideComponent;
  @ViewChild('services') services!: ElementRef;
  @ViewChild('searchForm') searchForm!: NgForm;
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Dependencies
  private reloadService = inject(ReloadService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishListService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private authorService = inject(AuthorService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  protected userDataService = inject(UserDataService);
  private activatedRoute = inject(ActivatedRoute);
  public translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subOne = this.reloadService.refreshData$.subscribe(() => {
      this.getAllNotifications();
    });

    const subLang = this.reloadService.refreshLang$.subscribe(res => {
      if (res) {
        this.isChangeLanguageToggle.set(res);
        this.isChangeLanguage.set(res === 'bn');
      }
    });

    const subRoute = this.activatedRoute.queryParamMap.subscribe(qParam => {
      const lang = qParam.get('language') || 'bn';
      if (lang === 'bn' || lang === 'en') {
        if (this.translateService.currentLang !== lang) {
          this.onChangeLanguage(lang, false);
        }
      }
    });

    // CART RELOAD
    const subCart = this.reloadService.refreshCart$.subscribe((res) => {
      if (res) {
        this.onCartSideToggling();
      }
      this.fetchCartItems();
    });

    this.fetchCartItems();

    if (this.userService.getUserStatus()) {
      const subWish = this.reloadService.refreshWishList$.subscribe(() => {
        this.getWishListByUser();
      });
      this.subscriptions.push(subWish);
      this.getWishListByUser();
      this.getLoggedInUserInfo();
    }

    const subCat = this.reloadService.refreshCategorySlide$.subscribe(res => {
      if (res) {
        this.onShowCategory();
      }
    });

    const subUser = this.userService.userStatusListener.subscribe(() => {
      this.isUser.set(this.userService.getUserStatus());
    });
    this.isUser.set(this.userService.getUserStatus());

    const subHeader = this.reloadService.getHeaderData.subscribe((res) => {
      if (res) {
        this.shopInfo.set(res);
      }
    });

    const subCompare = this.reloadService.refreshCompareList$.subscribe(() => {
      this.updateCompareCount();
    });

    this.subscriptions.push(subOne, subLang, subRoute, subCart, subCat, subUser, subHeader, subCompare);

    this.updateCompareCount();
    this.scheduleNonCriticalHeaderRequests();
  }

  private scheduleNonCriticalHeaderRequests() {
    if (!this.isBrowser) {
      return;
    }

    const run = () => {
      this.getAllAuthors();
      this.getAllNotifications();
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 4000 });
    } else {
      setTimeout(run, 2500);
    }
  }

  updateCompareCount() {
    this.compareItemsCount.set(this.productService.getCompareList().length);
  }

  private getLoggedInUserInfo() {
    const subLogin = this.userDataService.getLoggedInUserData()
      .subscribe({
        next: (res) => {
          if (res) {
            this.user.set(res.data);
          }
        },
        error: (error: any) => {
          console.log(error);
        }
      });
    this.subscriptions.push(subLogin);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.searchAnim();
    }
    const formValue = this.searchForm?.valueChanges;

    const subSearch = formValue?.pipe(
      pluck('searchTerm'),
      debounceTime(150),
      distinctUntilChanged(),
      switchMap(data => {
        const query = (data as string)?.trim();
        if (!query) {
          this.overlay.set(false);
          this.searchProducts.set([]);
          this.searchQuery = null;
          return EMPTY;
        }
        this.isLoading.set(true);
        const pagination: Pagination = {
          pageSize: 12,
          currentPage: 0
        };
        const mSelect = {
          name: 1, images: 1, category: 1, subCategory: 1, brand: 1,
          costPrice: 1, salePrice: 1, author: 1, hasVariations: 1,
          variations: 1, variationsOptions: 1, status: 1, slug: 1,
          discountAmount: 1, discountType: 1,
          offerDiscountAmount: 1, offerDiscountType: 1, resetDiscount: 1
        };

        const filterData: FilterData = {
          pagination: pagination,
          filter: { status: 'publish' },
          select: mSelect,
          sort: { createdAt: -1 }
        };
        return this.productService.getAllProducts(filterData, query);
      })
    ).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.searchProducts.set(res.data);
        if (this.searchProducts().length > 0) {
          this.isOpen.set(true);
          this.overlay.set(true);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.log(error);
      }
    });

    if (subSearch) this.subscriptions.push(subSearch);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchProducts().length - 1);
      event.preventDefault();
    } else if (event.key === 'Enter') {
      this.goToDetailsPage();
      event.preventDefault();
    }
  }

  private getAllNotifications() {
    const filterData: FilterData = {
      filter: { isReadNoti: false },
      select: undefined,
      sort: undefined,
      pagination: undefined,
    };

    const subNoti = this.notificationService
      .getAllNotifications(filterData, undefined)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.notificationsCount.set(res.count);
          }
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    this.subscriptions.push(subNoti);
  }
  private searchAnim() {
    if (!this.searchInput) return;
    const target = this.searchInput.nativeElement as HTMLInputElement;
    target.placeholder = '|';
    this.typeIt(target);
  }

  private typeIt(target: HTMLInputElement) {
    const humanize = Math.round(Math.random() * (300 - 30)) + 30;

    this.timeOutOngoing = setTimeout(() => {
      this.char++;
      let type = this.txt[this.indicator].substring(0, this.char);
      target.placeholder = type + '|';
      this.typeIt(target);
      if (this.char === this.txt[this.indicator]?.length) {
        target.placeholder = '|';
        this.char = 0;
        if (this.indicator < (this.txt.length - 1)) {
          this.indicator++;
        } else {
          this.indicator = 0;
        }
      }
    }, humanize);
  }

  onClickHeader(): void {
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.handleCloseOnly();
  }

  onClickSearchArea(event: MouseEvent): void {
    event.stopPropagation();
  }

  handleFocus(event: FocusEvent): void {
    if (this.searchInput) this.searchInput.nativeElement.focus();

    if (this.isFocused()) {
      return;
    }
    if (this.searchProducts().length > 0) {
      this.setPanelState(event);
    }
    this.isFocused.set(true);
  }

  private setPanelState(event: FocusEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen.set(false);
    this.handleOpen();
  }

  handleOpen(): void {
    if (this.isOpen() || (this.isOpen() && !this.isLoading())) {
      return;
    }
    if (this.searchProducts().length > 0) {
      this.isOpen.set(true);
      this.overlay.set(true);
    }
  }

  handleOutsideClick(): void {
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    if (!this.isOpen()) {
      return;
    }
    this.isOpen.set(false);
    this.overlay.set(false);
    this.isFocused.set(false);
    this.searchProducts.set([]);
  }

  handleCloseOnly(): void {
    if (!this.isOpen()) {
      this.isFocused.set(false);
      return;
    }
    this.isOpen.set(false);
    this.overlay.set(false);
    this.isFocused.set(false);
  }

  handleCloseAndClear(): void {
    if (!this.isOpen()) {
      this.isFocused.set(false);
      return;
    }
    this.isOpen.set(false);
    this.overlay.set(false);
    this.searchProducts.set([]);
    this.isFocused.set(false);
  }

  onSelectItem(data: Product, index: number): void {
    this.selectedIndex = index;
    if (this.searchInput) this.searchInput.nativeElement.value = '';
    this.handleCloseAndClear();
    this.router.navigate(['/product-details', data?.slug]);
  }

  goToDetailsPage(): void {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.searchProducts().length) {
      const selectedProduct = this.searchProducts()[this.selectedIndex];
      this.router.navigate(['/product-details', selectedProduct?.slug]);
    }
  }

  onSearchNavigate() {
    if (!this.searchInput) return;
    let inputVal = (this.searchInput.nativeElement as HTMLInputElement).value;
    if (inputVal) {
      this.router.navigate(['/', 'product-list'], {
        queryParams: { searchQuery: inputVal },
        queryParamsHandling: ''
      });
      this.searchInput.nativeElement.value = "";
      this.isOpen.set(false);
      this.reloadService.needRefreshSearch$(true);
    }
  }

  getAllAuthors() {
    let mSelect = { name: 1, slug: 1, image: 1, createdAt: 1, description: 1, birthDate: 1 };
    const filter: FilterData = {
      select: mSelect, filter: null, sort: { createdAt: -1 }, pagination: undefined
    }

    this.isLoadingAuthor.set(true);
    const subAuthor = this.authorService.getAllAuthors(filter, undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.authors = res.data;
          this.isLoadingAuthor.set(false);
        }
      },
      error: (err: any) => {
        console.log(err);
        this.isLoadingAuthor.set(false);
      }
    });
    this.subscriptions.push(subAuthor);
  }

  private fetchCartItems() {
    if (this.userService.getUserStatus()) {
      const subCartItems = this.cartService.getCartByUser().subscribe((res) => {
        this.carts.set(res.data);
        this.cartService.updateCartList(this.carts());
      });
      this.subscriptions.push(subCartItems);
    } else {
      this.getCartItemFromLocalStorage();
    }
  }

  private getWishListByUser() {
    const subWishList = this.wishlistService.getWishListByUser()
      .subscribe({
        next: (res) => {
          this.wishlists.set(res.data);
        },
        error: (error: any) => {
          console.log(error);
        }
      });
    this.subscriptions.push(subWishList);
  }

  getCartItemFromLocalStorage() {
    this.carts.set(this.cartService.getCartItemFromLocalStorage());
  }

  onChangeLanguage(language: string, updateUrl = true) {
    if (this.translateService.currentLang === language) {
      return;
    }
    this.isChangeLanguage.set(language === 'bn');
    this.isChangeLanguageToggle.set(language);
    this.translateService.use(language);
    this.reloadService.needRefreshLang$(language);

    if (updateUrl) {
      this.router.navigate([], {
        queryParams: { language: language },
        queryParamsHandling: 'merge'
      });
    }
  }

  onChangeLanguageToggle(language: string) {
    const nextLang = this.isChangeLanguageToggle() === 'bn' ? 'en' : 'bn';
    this.onChangeLanguage(nextLang);
  }

  @HostListener('window:scroll')
  scrollBody() {
    if (this.isBrowser) {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 400) {
        this.headerFixed.set(false);
        this.showMegaMenu.set(false);
      } else {
        this.headerFixed.set(true);
        if (currentScrollY < this.lastScrollY) {
          this.showMegaMenu.set(true);
        } else {
          this.showMegaMenu.set(false);
        }
      }

      this.lastScrollY = currentScrollY;
    }
  }

  onSideNavToggling() {
    if (this.side_nav) this.side_nav.onshowHideSideNav();
  }

  onCartSideToggling() {
    if (this.cart_slide) this.cart_slide.cartSlideShowHide();
  }

  onShowCategory() {
    if (this.category_slide) this.category_slide.onShowCategory();
  }

  onNavigateAccount() {
    if (this.isUser()) {
      if (this.router.url.indexOf('account') > -1) {
        this.reloadService.needRefreshAccountSideBar$(true);
      } else {
        this.router.navigate(['/account']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.timeOutOngoing) {
      clearTimeout(this.timeOutOngoing);
    }
  }
}
