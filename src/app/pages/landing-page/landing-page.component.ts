import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  ElementRef,
  viewChild,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

import { LandingPage, LandingPageComboGift, LandingPageComboOffer } from '../../interfaces/common/landing-page';
import { Product } from '../../interfaces/common/product';
import { Cart } from '../../interfaces/common/cart.interface';
import { LandingPageService } from '../../services/common/landing-page.service';
import { CartService } from '../../services/common/cart.service';
import { UserService } from '../../services/common/user.service';
import { UiService } from '../../services/core/ui.service';
import { ReloadService } from '../../services/core/reload.service';
import { SeoService } from '../../services/core/seo.service';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import {
  LandingComboCheckoutMeta,
  LandingComboCheckoutService,
} from '../../services/common/landing-combo-checkout.service';
import { DivisionService } from '../../services/common/division.service';
import { AreaService } from '../../services/common/area.service';
import { OrderService } from '../../services/common/order.service';
import { UserDataService } from '../../services/common/user-data.service';
import { UtilsService } from '../../services/core/utils.service';
import { GeneralDropdownComponent } from '../../shared/components/general-dropdown/general-dropdown.component';
import { OrderStatus } from '../../enum/order.enum';
import { getVisibleSalePrice } from '../../core/schema/utils/product-price.util';
import { isInvalidPublicSlug } from '../../core/utils/html-content.util';
import { BookPreviewReaderComponent } from '../../shared/components/book-preview-reader/book-preview-reader.component';
import { PaymentService } from '../../services/common/payment.service';
import { SslInit } from '../../interfaces/common/ssl-init';
import { environment } from '../../../environments/environment';

const DEFAULT_PRIMARY = '#1a4d2e';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  host: {
    class: 'landing-page-host',
    '[style.--lp-primary]': 'primaryColor()',
    '[style.--lp-primary-dark]': 'primaryColorDark()',
    '[style.--lp-primary-light]': 'primaryColorLight()',
  },
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogModule,
    SafeHtmlPipe,
  ],
  providers: [PricePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly landingPageService = inject(LandingPageService);
  private readonly cartService = inject(CartService);
  private readonly userService = inject(UserService);
  private readonly userDataService = inject(UserDataService);
  private readonly orderService = inject(OrderService);
  private readonly divisionService = inject(DivisionService);
  private readonly areaService = inject(AreaService);
  private readonly uiService = inject(UiService);
  private readonly reloadService = inject(ReloadService);
  private readonly seoService = inject(SeoService);
  private readonly landingComboCheckoutService = inject(LandingComboCheckoutService);
  private readonly pricePipe = inject(PricePipe);
  private readonly utilsService = inject(UtilsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly matDialog = inject(MatDialog);
  private readonly paymentService = inject(PaymentService);
  readonly translateService = inject(TranslateService);

  private readonly productsSection = viewChild<ElementRef<HTMLElement>>('productsSection');
  private readonly checkoutSection = viewChild<ElementRef<HTMLElement>>('checkoutSection');

  checkoutForm!: FormGroup;
  divisions = signal<any[]>([]);
  areas = signal<any[]>([]);
  shippingCharge = signal(50);
  isSubmitting = signal(false);
  shopInfo = signal<any>(null);

  landingPage = signal<LandingPage | null>(null);
  isLoading = signal(true);
  selectedProductIds = signal<string[]>([]);
  selectedComboIndex = signal<number | null>(null);
  expandedComboIndex = signal<number | null>(null);
  displayComboIndex = signal<number>(0);

  primaryColor = computed(() => this.landingPage()?.primaryColor?.trim() || DEFAULT_PRIMARY);

  primaryColorDark = computed(() => this.shadeColor(this.primaryColor(), -18));

  primaryColorLight = computed(() => this.shadeColor(this.primaryColor(), 28));

  products = computed(() => this.landingPage()?.products ?? []);

  comboOffers = computed(() => this.landingPage()?.comboOffers ?? []);

  hasComboOffers = computed(() => this.comboOffers().length > 0);

  freeDeliveryThreshold = computed(() => this.landingPage()?.freeDeliveryThreshold ?? 999);

  showProductSection = computed(
    () => this.hasComboOffers() || this.products().length > 0,
  );

  showIndividualProducts = computed(
    () => this.products().length > 0,
  );

  orderMode = signal<'combo' | 'product'>('product');

  trustItems = computed(() => this.landingPage()?.trustItems ?? []);
  benefitCards = computed(() => this.landingPage()?.benefitCards ?? []);

  features = computed(() => this.landingPage()?.features ?? []);

  insidePages = computed(() => this.landingPage()?.insidePages ?? []);

  selectedCount = computed(() => {
    let count = 0;
    if (this.selectedComboIndex() !== null) {
      count += 1;
    }
    count += this.selectedProductIds().length;
    return count;
  });

  allAvailableProducts = computed(() => {
    let prods: Product[] = [];
    if (this.products()?.length) {
      prods = [...prods, ...this.products()];
    }
    if (this.hasComboOffers()) {
      for (const combo of this.comboOffers()) {
        if (combo.products?.length) {
          prods = [...prods, ...combo.products];
        }
      }
    }
    prods = prods.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
    return prods;
  });

  extraSelectedProducts = computed(() => {
    const selectedIds = this.selectedProductIds();
    return this.allAvailableProducts().filter(product => product._id && selectedIds.includes(product._id));
  });

  selectedPaidProducts = computed(() => {
    const combo = this.getSelectedCombo();
    const comboProducts = combo?.products ?? [];

    const extraProducts = this.extraSelectedProducts();

    return [...comboProducts, ...extraProducts];
  });

  comboCheckoutMeta = computed(() => {
    if (this.selectedComboIndex() === null) {
      return null;
    }
    const page = this.landingPage();
    const combo = this.getSelectedCombo();
    if (!page?.slug || !combo) {
      return null;
    }
    return this.landingComboCheckoutService.buildMeta(page.slug, combo);
  });

  selectedCombo = computed(() => this.getSelectedCombo());

  displayCombo = computed(() => {
    const index = this.displayComboIndex();
    return this.comboOffers()[index] ?? null;
  });

  orderFreeBooks = computed(() => this.comboCheckoutMeta()?.freeBooks ?? []);

  orderFreeGifts = computed(() => this.comboCheckoutMeta()?.freeGifts ?? []);

  orderSubTotal = computed(() => {
    let total = 0;
    const comboMeta = this.comboCheckoutMeta();
    if (comboMeta) {
      total += this.landingComboCheckoutService.getComboSubTotal(comboMeta);
    }

    const extraProducts = this.extraSelectedProducts();

    total += extraProducts.reduce(
      (sum, product) => sum + getVisibleSalePrice(product),
      0
    );

    return total;
  });

  orderDiscount = computed(() => {
    let discount = 0;
    const comboMeta = this.comboCheckoutMeta();
    if (comboMeta) {
      const regularTotal = this.landingComboCheckoutService.getProductsSubTotal(
        comboMeta.paidProducts ?? []
      );
      discount += Math.max(0, regularTotal - this.landingComboCheckoutService.getComboSubTotal(comboMeta));
    }

    const extraProducts = this.extraSelectedProducts();

    discount += extraProducts.reduce(
      (sum, product) => sum + ((this.pricePipe.transform(product, 'discountAmount') as number) || 0),
      0
    );

    return discount;
  });

  orderGrandTotal = computed(() => this.orderSubTotal() + this.shippingCharge());

  hasFreeDelivery = computed(() =>
    this.landingComboCheckoutService.hasFreeDelivery(this.comboCheckoutMeta()) ||
    this.orderSubTotal() >= this.freeDeliveryThreshold()
  );

  hasHeroDiscount = computed(() => {
    const page = this.landingPage();
    return (page?.discountPercent ?? 0) > 0 || (page?.originalPrice ?? 0) > (page?.salePrice ?? 0);
  });

  heroDiscountLabel = computed(() => {
    const page = this.landingPage();
    if ((page?.discountPercent ?? 0) > 0) {
      return `-${page!.discountPercent}%`;
    }
    const original = page?.originalPrice ?? 0;
    const sale = page?.salePrice ?? 0;
    if (original > sale && original > 0) {
      return `-${Math.round(((original - sale) / original) * 100)}%`;
    }
    return '';
  });

  pdfProducts = computed(() => {
    let prods: Product[] = [];
    if (this.hasComboOffers()) {
      for (const combo of this.comboOffers()) {
        if (combo.products?.length) {
          prods = [...prods, ...combo.products];
        }
        if (combo.freeBooks?.length) {
          prods = [...prods, ...combo.freeBooks];
        }
      }
    }
    // Remove duplicates
    prods = prods.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);

    return prods;
  });

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initCheckoutForm();
    this.updateShippingCharge();
    if (this.userService.getUserStatus()) {
      this.fetchUserData();
    }

    const subRoute = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug) {
        this.router.navigate(['/']);
        return;
      }
      if (isInvalidPublicSlug(slug)) {
        this.router.navigate(['/']);
        return;
      }
      this.fetchLandingPage(slug);
    });
    this.subscriptions.push(subRoute);

    const subHeader = this.reloadService.getHeaderData.subscribe((res) => {
      if (res) {
        this.shopInfo.set(res);
      }
    });
    this.subscriptions.push(subHeader);
  }

  private fetchLandingPage(slug: string): void {
    this.isLoading.set(true);
    const sub = this.landingPageService.getLandingPageBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.template === 'v2') {
            this.router.navigate(['/landing-page-2', slug]);
            return;
          }
          if (res.data.template === 'v3') {
            this.router.navigate(['/landing-page-3', slug]);
            return;
          }
          this.landingPage.set(res.data);
          if (res.data.comboOffers?.length) {
            this.orderMode.set('combo');
            this.initComboSelection(res.data.comboOffers);
          } else {
            this.orderMode.set('product');
            this.initProductSelection(res.data.products ?? []);
          }
          this.updateShippingCharge();
          this.updateSeo(res.data);
        } else {
          this.seoService.clearSchema();
          this.router.navigate(['/']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.seoService.clearSchema();
        this.router.navigate(['/']);
      },
    });
    this.subscriptions.push(sub);
  }

  private updateSeo(page: LandingPage): void {
    this.seoService.updateMetaData({
      title: page.seoTitle || page.title || page.name,
      description: page.seoDescription || page.subtitle || '',
      image: page.heroImage || page.images?.[0],
      canonicalPath: `/landing-page/${page.slug}`,
    });

    this.seoService.setWebPageSchema(
      `/landing-page/${page.slug}`,
      page.seoTitle || page.title || page.name || 'Promotion',
      [{ label: page.title || page.name || 'Promotion', isCurrent: true }],
    );
  }

  productTitle(product: Product): string {
    const isEn = this.translateService.currentLang === 'en';
    return isEn ? (product.nameEn || product.name) : product.name;
  }

  productImage(product: Product): string {
    return product.images?.length ? product.images[0]! : '/images/placeholder/test.png';
  }

  hasProductDiscount(product: Product): boolean {
    return (
      (product.discountType === 1 && (product.discountAmount ?? 0) > 0) ||
      (product.offerDiscountType === 1 && (product.offerDiscountAmount ?? 0) > 0) ||
      (product.discountType === 2 && (product.discountAmount ?? 0) > 0) ||
      (product.offerDiscountType === 2 && (product.offerDiscountAmount ?? 0) > 0)
    );
  }

  hasPreview(product: Product): boolean {
    return (product.previewImages?.length ?? 0) > 0 || !!product.pdfUrl || !!product.pdfFile;
  }

  openBookPreview(product: Product) {
    // If the product doesn't have a preview, the reader component will probably just show the cover
    // or handle it gracefully. We allow it to open anyway since the user requested it.
    this.matDialog.open(BookPreviewReaderComponent, {
      data: { product: product },
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: ['book-preview-dialog'],
      backdropClass: 'book-preview-backdrop',
      autoFocus: false,
    });
  }

  scrollToProducts(): void {
    this.scrollToSection(this.productsSection());
  }

  scrollToCheckout(): void {
    this.scrollToSection(this.checkoutSection());
  }

  scrollToInsidePages(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const section = document.getElementById('inside-pages-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private scrollToSection(section?: ElementRef<HTMLElement>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    section?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onOrderNow(): void {
    if (this.showProductSection()) {
      this.scrollToCheckout();
      return;
    }
    this.scrollToProducts();
  }

  onBuyNow(): void {
    if (!this.selectedCount()) {
      if (this.hasComboOffers()) {
        this.initComboSelection(this.comboOffers());
      } else {
        this.initProductSelection(this.products());
      }
    }
    this.scrollToCheckout();
  }

  isComboSelected(index: number): boolean {
    return this.selectedComboIndex() === index;
  }

  selectCombo(index: number): void {
    this.displayComboIndex.set(index);
    if (this.selectedComboIndex() === index) {
      this.selectedComboIndex.set(null); // Allow deselecting
    } else {
      this.selectedComboIndex.set(index);
    }
    this.updateShippingCharge();
  }

  toggleComboExpand(index: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedComboIndex() === index) {
      this.expandedComboIndex.set(null);
    } else {
      this.expandedComboIndex.set(index);
    }
  }

  comboTitle(combo: LandingPageComboOffer): string {
    return combo.title || 'কম্বো অফার';
  }

  comboSubtitle(combo: LandingPageComboOffer): string {
    if (combo.subtitle) {
      return combo.subtitle;
    }
    const names = (combo.products ?? []).map((product) => this.productTitle(product));
    return names.join(' + ');
  }

  comboImage(combo: LandingPageComboOffer): string {
    const firstProduct = combo.products?.[0];
    return firstProduct ? this.productImage(firstProduct) : '/images/placeholder/test.png';
  }

  hasComboDiscount(combo: LandingPageComboOffer): boolean {
    if (combo.pricingMode === 'discount') {
      return (combo.discountAmount ?? 0) > 0;
    }
    return (combo.originalPrice ?? 0) > (combo.salePrice ?? 0);
  }

  comboDisplayPrice(combo: LandingPageComboOffer): number {
    const meta = this.landingComboCheckoutService.buildMeta(
      this.landingPage()?.slug || '',
      combo,
    );
    return this.landingComboCheckoutService.getComboSubTotal(meta);
  }

  comboOriginalPrice(combo: LandingPageComboOffer): number {
    if (combo.originalPrice) {
      return combo.originalPrice;
    }
    return this.landingComboCheckoutService.getProductsSubTotal(combo.products ?? []);
  }

  comboDiscountPercent(combo: LandingPageComboOffer): number {
    if (combo.pricingMode === 'discount') {
      if (combo.discountType === 1 && combo.discountAmount) {
        return combo.discountAmount;
      }
      const total = this.landingComboCheckoutService.getProductsSubTotal(combo.products ?? []);
      if (combo.discountType === 2 && combo.discountAmount && total > 0) {
        return Math.round((combo.discountAmount / total) * 100);
      }
      return 0;
    }

    const original = this.comboOriginalPrice(combo);
    const sale = this.comboDisplayPrice(combo);
    if (original <= sale || original <= 0) {
      return 0;
    }
    return Math.round(((original - sale) / original) * 100);
  }

  comboBenefitLabels(combo: LandingPageComboOffer): string[] {
    return this.landingComboCheckoutService.getBenefitLabels(combo);
  }

  comboBadgeText(combo: LandingPageComboOffer): string {
    return combo.badgeText || '🔥 সেরা অফার';
  }

  showComboBadge(combo: LandingPageComboOffer, index: number): boolean {
    return !!combo.isBestOffer || !!combo.badgeText || index === 0;
  }

  isProductSelected(productId?: string): boolean {
    return !!productId && this.selectedProductIds().includes(productId);
  }

  toggleProductSelection(productId?: string): void {
    if (!productId) {
      return;
    }
    const current = this.selectedProductIds();
    if (current.includes(productId)) {
      this.selectedProductIds.set(current.filter(id => id !== productId));
    } else {
      this.selectedProductIds.set([...current, productId]);
    }
    this.updateShippingCharge();
  }

  onOrderSelected(): void {
    if (!this.selectedCount()) {
      this.uiService.warn(
        this.hasComboOffers()
          ? 'অনুগ্রহ করে একটি কম্বো অফার বা বই নির্বাচন করুন।'
          : 'অনুগ্রহ করে অন্তত একটি বই নির্বাচন করুন।',
      );
      return;
    }
    this.scrollToCheckout();
  }



  onConfirmOrder(): void {
    if (!this.selectedCount()) {
      this.uiService.warn('অনুগ্রহ করে অন্তত একটি পণ্য নির্বাচন করুন।');
      return;
    }

    if (!this.checkoutForm.get('agreeTerms')?.value) {
      this.uiService.warn('অনুগ্রহ করে শর্তাবলী গ্রহণ করুন।');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.uiService.warn('অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।');
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const comboMeta = this.comboCheckoutMeta();
    if (comboMeta) {
      this.landingComboCheckoutService.save(comboMeta);
    } else {
      this.landingComboCheckoutService.clear();
    }

    const formValue = this.checkoutForm.getRawValue();
    const paidProducts = this.selectedPaidProducts();
    const isLoggedIn = this.userService.getUserStatus();
    const carts = paidProducts.map((product) => product._id);
    const cartData: Cart[] = paidProducts.map((product) => ({
      product: product._id,
      selectedQty: 1,
    }));

    const orderedItems = [
      ...this.buildPaidOrderItems(paidProducts),
      ...this.buildComboFreeOrderItems(comboMeta),
      ...this.buildComboGiftOrderItems(comboMeta),
    ];

    const regularProductsTotal = paidProducts.reduce(
      (acc, product) =>
        acc + (this.pricePipe.transform(product, 'regularPrice') as number),
      0,
    );
    let cartDiscountAmount = this.orderDiscount();

    const deliveryCharge = this.hasFreeDelivery() ? 0 : this.shippingCharge();

    const orderData = {
      name: formValue.name,
      phoneNo: formValue.phoneNumber,
      city: formValue.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
      shippingAddress: formValue.shippingAddress,
      note: formValue.giftMessage ? `Gift Message: ${formValue.giftMessage}` : '',
      carts,
      cartData,
      paymentType: formValue.paymentMethod,
      country: 'bangladesh',
      paymentStatus: 'unpaid',
      orderStatus: OrderStatus.PENDING,
      orderedItems,
      orderFrom: 'Landing Page',
      offerSummary: comboMeta
        ? this.landingComboCheckoutService.buildOfferSummary(comboMeta)
        : undefined,
      subTotal: this.orderSubTotal(),
      deliveryCharge,
      discount: cartDiscountAmount.toFixed(2),
      totalSave: cartDiscountAmount,
      grandTotal: this.orderGrandTotal(),
      discountTypes: [{ productDiscount: cartDiscountAmount.toFixed(2) }],
      checkoutDate: this.utilsService.getDateString(new Date()),
      hasOrderTimeline: true,
      orderTimeline: {
        pending: { success: true, date: new Date(), expectedDate: new Date() },
        confirmed: { success: false, date: null, expectedDate: null },
        processed: { success: false, date: null, expectedDate: null },
        shipped: { success: false, date: null, expectedDate: null },
        delivered: { success: false, date: null, expectedDate: null },
        canceled: { success: false, date: null, expectedDate: null },
        refunded: { success: false, date: null, expectedDate: null },
      },
    };

    this.isSubmitting.set(true);
    this.orderService.addOrder(orderData as any, isLoggedIn).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (!res.success) {
          this.uiService.warn(res.message || 'অর্ডার সম্পন্ন করা যায়নি।');
          return;
        }

        if ((res as any).paymentUrl) {
          window.location.href = (res as any).paymentUrl;
          return;
        } else if (res.data && res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
          return;
        }

        this.uiService.success(res.message || 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।');
        this.landingComboCheckoutService.clear();
        this.reloadService.needRefreshCart$(false);
        if (!isLoggedIn) {
          this.cartService.deleteAllCartFromLocal(true);
        }

        if (orderData.paymentType === 'online_payment') {
          const sslData: SslInit = {
            total_amount: this.orderGrandTotal(),
            currency: 'BDT',
            tran_id: res.data.orderId,
            success_url: environment.apiBaseLink + '/api/payment/ssl-payment-success',
            fail_url: environment.apiBaseLink + '/api/payment/ssl-payment-fail',
            cancel_url: environment.apiBaseLink + '/api/payment/ssl-payment-cancel',
            shipping_method: 'Courier',
            product_name: 'Books',
            product_category: 'Books',
            product_profile: 'general',
            cus_name: formValue.name,
            cus_email: 'test@test.com',
            cus_add1: formValue.shippingAddress,
            cus_add2: '',
            cus_city: formValue.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
            cus_state: formValue.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: formValue.phoneNumber,
            cus_fax: formValue.phoneNumber,
            ship_name: formValue.name,
            ship_add1: formValue.shippingAddress,
            ship_add2: '',
            ship_city: formValue.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
            ship_state: formValue.deliveryArea === 'inside_dhaka' ? 'Dhaka' : 'Outside Dhaka',
            ship_postcode: '1000',
            ship_country: 'Bangladesh',
          };
          this.paymentService.initSslPayment(sslData).subscribe({
            next: (sslRes: any) => {
              // Debugging
              // this.uiService.warn(JSON.stringify(sslRes));

              if (sslRes.success && sslRes.data) {
                if (typeof sslRes.data === 'string' && sslRes.data.includes('http')) {
                  window.location.href = sslRes.data;
                  return;
                }
                if (sslRes.data.GatewayPageURL) {
                  window.location.href = sslRes.data.GatewayPageURL;
                  return;
                }
              }

              if (sslRes.paymentUrl || sslRes.url || (sslRes.data && sslRes.data.url)) {
                window.location.href = sslRes.paymentUrl || sslRes.url || sslRes.data.url;
                return;
              }

              this.uiService.warn('পেমেন্ট গেটওয়ের লিংক পাওয়া যায়নি: ' + JSON.stringify(sslRes));

              this.router.navigate(['/payment/success'], {
                queryParams: { orderId: res.data.orderId },
              });
            },
            error: (err) => {
              this.uiService.warn('পেমেন্ট গেটওয়েতে সমস্যা হয়েছে: ' + err.message);
              this.router.navigate(['/payment/success'], {
                queryParams: { orderId: res.data.orderId },
              });
            }
          });
        } else {
          this.router.navigate(['/payment/success'], {
            queryParams: { orderId: res.data.orderId },
          });
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.uiService.wrong('দুঃখিত! অর্ডারটি সম্পন্ন করা সম্ভব হয়নি।');
      },
    });
  }

  isGiftWrapSelected = signal<boolean>(false);
  giftPackagePrice = signal<number>(0);

  private initCheckoutForm(): void {
    this.checkoutForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/), Validators.minLength(11), Validators.maxLength(11)]],
      deliveryArea: ['inside_dhaka', Validators.required],
      shippingAddress: ['', Validators.required],
      giftWrap: [false],
      giftMessage: [''],
      paymentMethod: ['cash_on_delivery', Validators.required],
      agreeTerms: [true, Validators.requiredTrue]
    });

    this.subscriptions.push(
      this.checkoutForm.get('deliveryArea')!.valueChanges.subscribe(() => {
        this.updateShippingCharge();
      })
    );
    this.subscriptions.push(
      this.checkoutForm.get('giftWrap')!.valueChanges.subscribe((val) => {
        this.isGiftWrapSelected.set(val);
      })
    );
  }


  private fetchUserData(): void {
    const sub = this.userDataService.getLoggedInUserData().subscribe((res) => {
      if (res?.data) {
        this.checkoutForm.patchValue({
          name: res.data.name,
          phoneNo: res.data.phoneNo,
        });
      }
    });
    this.subscriptions.push(sub);
  }


  showAllCombos = signal(false);

  toggleShowAllCombos() {
    this.showAllCombos.update(v => !v);
  }

  singleProducts = computed(() => this.products());

  clearCombo() {
    this.selectedComboIndex.set(null);
  }

  deliveryCharge = computed(() => this.hasFreeDelivery() ? 0 : this.shippingCharge());

  orderTotal = computed(() => this.orderGrandTotal());

  updateShippingCharge(): void {
    if (this.hasFreeDelivery()) {
      this.shippingCharge.set(0);
      return;
    }
    const area = this.checkoutForm?.get('deliveryArea')?.value;
    if (area === 'inside_dhaka') {
      this.shippingCharge.set(50);
    } else {
      this.shippingCharge.set(90);
    }
  }

  private buildPaidOrderItems(products: Product[]) {
    return products.map((product) => ({
      _id: product._id,
      name: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      image: product.images?.length ? product.images[0] : null,
      category: {
        _id: product.category?._id,
        name: product.category?.name,
        slug: product.category?.slug,
      },
      author: {
        _id: product.author?._id,
        name: product.author?.name,
        slug: product.author?.slug,
      },
      subCategory: {
        _id: product.subCategory?._id,
        name: product.subCategory?.name,
        slug: product.category?.slug,
      },
      brand: {
        _id: product.brand?._id,
        name: product.brand?.name,
        slug: product.category?.slug,
      },
      discountType: product.discountType,
      discountAmount: product.discountAmount,
      regularPrice: this.pricePipe.transform(product, 'regularPrice'),
      unitPrice: this.pricePipe.transform(product, 'salePrice'),
      salePrice: this.pricePipe.transform(product, 'salePrice'),
      quantity: 1,
      orderType: 'regular',
      color: null,
      size: null,
    }));
  }

  private buildComboFreeOrderItems(comboMeta: LandingComboCheckoutMeta | null) {
    const freeBooks = comboMeta?.freeBooks ?? [];
    const uniqueBooks = freeBooks.filter(
      (book, index, list) => list.findIndex((item) => item._id === book._id) === index,
    );

    return uniqueBooks.map((product) => ({
      _id: product._id,
      name: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      image: product.images?.length ? product.images[0] : null,
      category: {
        _id: product.category?._id,
        name: product.category?.name,
        slug: product.category?.slug,
      },
      author: {
        _id: product.author?._id,
        name: product.author?.name,
        slug: product.author?.slug,
      },
      subCategory: {
        _id: product.subCategory?._id,
        name: product.subCategory?.name,
        slug: product.category?.slug,
      },
      brand: {
        _id: product.brand?._id,
        name: product.brand?.name,
        slug: product.category?.slug,
      },
      discountType: 0,
      discountAmount: 0,
      regularPrice: 0,
      unitPrice: 0,
      salePrice: 0,
      quantity: 1,
      orderType: 'free',
      color: null,
      size: null,
    }));
  }

  private buildComboGiftOrderItems(comboMeta: LandingComboCheckoutMeta | null) {
    const gifts = comboMeta?.freeGifts ?? [];
    return gifts.map((gift: LandingPageComboGift, index: number) => ({
      _id: `combo-gift-${index}`,
      name: gift.name,
      nameEn: gift.nameEn || gift.name,
      slug: null,
      image: gift.image ?? null,
      category: null,
      author: null,
      subCategory: null,
      brand: null,
      discountType: 0,
      discountAmount: 0,
      regularPrice: 0,
      unitPrice: 0,
      salePrice: 0,
      quantity: 1,
      orderType: 'gift',
      color: null,
      size: null,
      description: gift.description ?? null,
    }));
  }

  private initComboSelection(combos: LandingPageComboOffer[]): void {
    const bestIndex = combos.findIndex((combo) => combo.isBestOffer);
    const initialIndex = bestIndex >= 0 ? bestIndex : combos.length ? 0 : null;
    this.selectedComboIndex.set(initialIndex);
    if (initialIndex !== null) {
      this.displayComboIndex.set(initialIndex);
    }
  }

  private getSelectedCombo(): LandingPageComboOffer | null {
    const index = this.selectedComboIndex();
    if (index === null) {
      return null;
    }
    return this.comboOffers()[index] ?? null;
  }

  private addComboToCart(combo: LandingPageComboOffer, showToast: boolean): void {
    const page = this.landingPage();
    if (!page?.slug) {
      return;
    }

    const meta = this.landingComboCheckoutService.buildMeta(page.slug, combo);
    this.landingComboCheckoutService.save(meta);

    if (!this.userService.getUserStatus()) {
      this.cartService.deleteAllCartFromLocal(false);
    }

    const products = combo.products ?? [];
    products.forEach((product, index) => {
      this.addProductToCart(
        product,
        showToast && index === products.length - 1,
      );
    });
  }

  private initProductSelection(products: Product[]): void {
    const firstId = products[0]?._id;
    this.selectedProductIds.set(firstId ? [firstId] : []);
  }

  private addSelectedProductsToCart(showToast: boolean): void {
    const selected = this.products().filter((p) => this.isProductSelected(p._id));
    selected.forEach((product, index) => {
      this.addProductToCart(product, showToast && index === selected.length - 1);
    });
  }

  onAddToCart(product: Product, event?: Event): void {
    event?.stopPropagation();
    this.addProductToCart(product, true);
  }

  private addProductToCart(product: Product, showToast: boolean): void {
    const data: Cart = {
      product: product._id,
      selectedQty: 1,
    };

    if (this.userService.getUserStatus()) {
      const sub = this.cartService.addToCart(data).subscribe({
        next: (res) => {
          if (showToast) {
            this.uiService.success(res.message);
          }
          this.reloadService.needRefreshCart$(true);
        },
        error: () => {
          if (showToast) {
            this.uiService.wrong('কার্টে যোগ করা যায়নি।');
          }
        },
      });
      this.subscriptions.push(sub);
      return;
    }

    this.cartService.addCartItemToLocalStorage(data);
    if (showToast) {
      this.uiService.success('বইটি কার্টে যুক্ত হয়েছে।');
    }
    this.reloadService.needRefreshCart$(true);
  }

  isFontAwesomeIcon(icon?: string): boolean {
    const value = icon?.trim() || '';
    return value.includes('fa-') || /^(fa[srb]?|fa-solid|fa-regular|fa-brands|fa)\s/i.test(value);
  }

  fontAwesomeIconClass(icon?: string): string {
    const value = icon?.trim() || '';
    if (!value) {
      return 'fa-solid fa-check';
    }
    if (/^(fa[srb]?|fa-solid|fa-regular|fa-brands|fa)\s/i.test(value)) {
      return value;
    }
    if (value.startsWith('fa-')) {
      return `fa-solid ${value}`;
    }
    return `fa-solid fa-${value.replace(/^fa-?/, '')}`;
  }

  isMaterialIcon(icon?: string): boolean {
    const value = icon?.trim() || '';
    if (!value || this.isFontAwesomeIcon(value)) {
      return false;
    }
    return /^[a-z][a-z0-9_]*$/i.test(value);
  }

  private shadeColor(hex: string, percent: number): string {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return hex;
    }

    const num = parseInt(normalized, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
