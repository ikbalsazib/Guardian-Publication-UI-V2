import { Component, OnDestroy, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cart } from '../../../interfaces/common/cart.interface';
import { AreaService } from '../../../services/common/area.service';
import { CartService } from '../../../services/common/cart.service';
import { DivisionService } from '../../../services/common/division.service';
import { OrderService } from '../../../services/common/order.service';
import { ProductService } from '../../../services/common/product.service';
import { ShippingChargeService } from '../../../services/common/shipping-charge.service';
import { SpecialPackagesService } from '../../../services/common/special-packages.service';
import { UserDataService } from '../../../services/common/user-data.service';
import { UserService } from '../../../services/common/user.service';
import { ZoneService } from '../../../services/common/zone.service';
import { ReloadService } from '../../../services/core/reload.service';
import { UiService } from '../../../services/core/ui.service';
import { DATABASE_KEY } from '../../../core/utils/global-variable';
import { GeneralDropdownComponent } from '../../../shared/components/general-dropdown/general-dropdown.component';
import { SelectToggleService } from '../../../services/common/select-toggle.service';
import { forkJoin, Subscription } from 'rxjs';
import { GtmService } from '../../../services/core/gtm.service';
import { OrderStatus } from '../../../enum/order.enum';
import { Product } from '../../../interfaces/common/product';
import { PricePipe } from '../../../shared/pipes/price.pipe';
import { UtilsService } from '../../../services/core/utils.service';
import { SeoService } from '../../../services/core/seo.service';
import {
  LandingComboCheckoutMeta,
  LandingComboCheckoutService,
} from '../../../services/common/landing-combo-checkout.service';
import { LandingPageComboGift } from '../../../interfaces/common/landing-page';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  providers: [PricePipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    GeneralDropdownComponent
  ]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  // Signals
  carts = signal<Cart[]>([]);
  isLoading = signal<boolean>(false);
  shippingCharge = signal<number>(0);
  subTotal = signal<number>(0);
  divisions = signal<any[]>([]);
  areas = signal<any[]>([]);
  zones = signal<any[]>([]);

  // Search
  searchDistrict = signal<string>('');
  searchArea = signal<string>('');

  filteredDivisions = signal<any[]>([]);
  filteredAreas = signal<any[]>([]);

  // Form
  checkoutForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private userDataService = inject(UserDataService);
  private shippingService = inject(ShippingChargeService);
  private divisionService = inject(DivisionService);
  private areaService = inject(AreaService);
  private zoneService = inject(ZoneService);
  private uiService = inject(UiService);
  private reloadService = inject(ReloadService);
  private productService = inject(ProductService);
  private comboPackageService = inject(SpecialPackagesService);
  private gtmService = inject(GtmService);
  private pricePipe = inject(PricePipe);
  private utilsService = inject(UtilsService);
  private seoService = inject(SeoService);
  private landingComboCheckoutService = inject(LandingComboCheckoutService);
  private translateService = inject(TranslateService);

  landingComboMeta: LandingComboCheckoutMeta | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  private readonly _selectToggle = inject(SelectToggleService);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-general-dropdown')) {
      this._selectToggle.selectToggle.next('');
    }
  }

  ngOnInit(): void {
    this.landingComboMeta = this.landingComboCheckoutService.get();
    this.seoService.clearSchema();
    this.seoService.updateMetaData({ title: this.translateService.instant('ln.Checkout') || 'Checkout', noIndex: true });
    this.initForm();
    this.fetchCarts();
    this.fetchDivisions();
    this.fetchShippingCharge();

    if (this.userService.getUserStatus()) {
      this.fetchUserData();
    }

    // Analytics
    this.trackInitiateCheckout();
  }

  private trackInitiateCheckout() {
    const payload = {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      eventId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      action_source: 'website',
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      custom_data: {
        currency: 'BDT'
      }
    };

    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('InitiateCheckout', {
        currency: 'BDT'
      }, payload.eventId);
    }

    // Client-side Tiktok pixel
    this.gtmService.trackByTiktokPixel('InitiateCheckout', {
      currency: 'BDT'
    }, payload.eventId);

    this.gtmService.trackInitiateCheckout(payload as any).subscribe();
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      addressType: ['home', Validators.required],
      name: ['', Validators.required],
      phoneNo: ['', [Validators.required, Validators.pattern(/^(01)[3-9][0-9]{8}$/)]],
      division: [null, Validators.required],
      area: [null, Validators.required],
      zone: [null],
      address: ['', Validators.required],
      paymentMethod: ['cash_on_delivery', Validators.required],
      deliveryChargeType: [{ value: 'inside_dhaka', disabled: true }, Validators.required],
      agreeTerms: [true, Validators.requiredTrue],
      note: ['']
    });
    // Set initial shipping charge
    this.shippingCharge.set(50);
  }

  // Coupon
  couponCode = signal<string>('');
  discount = signal<number>(0);

  applyCoupon() {
    if (!this.couponCode()) {
      this.uiService.warn(this.translateService.instant('ln.EnterCouponCode'));
      return;
    }
    // Logic for coupon apply will go here
    this.uiService.warn(this.translateService.instant('ln.CouponNotActive'));
  }

  onDeliveryChargeChange(value: string) {
    if (this.hasComboFreeDelivery()) {
      this.shippingCharge.set(0);
      return;
    }
    const hasFreeDelivery = this.carts().some(item => (item.product as any)?.freeDelivery === true);
    if (hasFreeDelivery) {
      this.shippingCharge.set(0);
      return;
    }
    if (value === 'inside_dhaka') {
      this.shippingCharge.set(50);
    } else {
      this.shippingCharge.set(90);
    }
  }

  private fetchCarts() {
    if (this.userService.getUserStatus()) {
      // Logged-in: fetch from server (already has full product objects)
      this.cartService.getCartByUser().subscribe(res => {
        if (res.success) {
          this.carts.set(res.data);
          this.calculateSubTotal();
        }
      });
    } else {
      // Guest: read local, then resolve product details from API
      this.fetchLocalCart();
    }
  }

  private fetchLocalCart() {
    const items = this.cartService.getCartItemFromLocalStorage();
    if (!items || items.length === 0) {
      this.carts.set([]);
      return;
    }

    const productIds = items.filter(i => !i.cartType || i.cartType === 2).map(i => i.product as string);
    const packageIds = items.filter(i => i.cartType === 1).map(i => i.specialPackage as string);

    const productObs = this.productService.getProductByIds(productIds, 'name salePrice images freeDelivery');
    const packageObs = this.comboPackageService.getProductByIds(packageIds);

    forkJoin([productObs, packageObs]).subscribe({
      next: ([pRes, sRes]) => {
        const products = pRes.data || [];
        const packages = sRes.data || [];

        const mapped = items.map(item => {
          if (item.cartType === 1) {
            const pkg = packages.find(p => p._id === item.specialPackage);
            if (!pkg) return item;
            return { ...item, product: { ...pkg, images: pkg.images || [] } };
          } else {
            const prod = products.find(p => p._id === item.product);
            return { ...item, product: prod };
          }
        });
        this.carts.set(mapped as any);
        this.calculateSubTotal();
      },
      error: () => { }
    });
  }

  private calculateSubTotal() {
    this.landingComboMeta = this.landingComboCheckoutService.get();

    if (this.landingComboMeta) {
      this.subTotal.set(this.landingComboCheckoutService.getComboSubTotal(this.landingComboMeta));
    } else {
      const total = this.carts().reduce((acc, item) => {
        const price = (item.product as any)?.salePrice || 0;
        return acc + (price * (item.selectedQty || 0));
      }, 0);
      this.subTotal.set(total);
    }

    if (this.hasComboFreeDelivery()) {
      this.shippingCharge.set(0);
      return;
    }

    const hasFreeDelivery = this.carts().some(item => (item.product as any)?.freeDelivery === true);
    if (hasFreeDelivery) {
      this.shippingCharge.set(0);
    } else {
      const divisionId = this.checkoutForm.get('division')?.value;
      if (divisionId) {
        this.onDivisionChange(divisionId);
      }
    }
  }

  private fetchDivisions() {
    this.divisionService.getAllDivisions({ filter: { status: 'publish' } }).subscribe(res => {
      const data = res.data.map((i: any) => ({ ...i, id: i._id }));
      this.divisions.set(data);
      this.filteredDivisions.set(data);
    });
  }

  filterDivisions(query: string) {
    this.searchDistrict.set(query);
    if (!query) {
      this.filteredDivisions.set(this.divisions());
      return;
    }
    const filtered = this.divisions().filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
    this.filteredDivisions.set(filtered);
  }

  filterAreas(query: string) {
    this.searchArea.set(query);
    if (!query) {
      this.filteredAreas.set(this.areas());
      return;
    }
    const filtered = this.areas().filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    this.filteredAreas.set(filtered);
  }

  onDivisionChange(id: string) {
    if (this.hasComboFreeDelivery()) {
      this.shippingCharge.set(0);
    }

    const hasFreeDelivery = this.hasComboFreeDelivery() ||
      this.carts().some(item => (item.product as any)?.freeDelivery === true);
    const selectedDiv = this.divisions().find(d => d._id === id);
    if (selectedDiv) {
      if (selectedDiv.name.toLowerCase().includes('dhaka')) {
        this.checkoutForm.get('deliveryChargeType')?.setValue('inside_dhaka');
        if (!hasFreeDelivery) {
          this.shippingCharge.set(50);
        }
      } else {
        this.checkoutForm.get('deliveryChargeType')?.setValue('outside_dhaka');
        if (!hasFreeDelivery) {
          this.shippingCharge.set(90);
        }
      }
    }
    if (hasFreeDelivery) {
      this.shippingCharge.set(0);
    }

    this.areaService.getAreaByParentId(id, 'name').subscribe(res => {
      const data = res.data.map((i: any) => ({ ...i, id: i._id }));
      this.areas.set(data);
      this.filteredAreas.set(data);
      this.checkoutForm.get('area')?.reset();
    });
  }

  onDivisionSelect(data: any) {
    if (data) {
      this.checkoutForm.get('division')?.setValue(data.id);
      this.onDivisionChange(data.id);
    }
  }

  onAreaSelect(data: any) {
    if (data) {
      this.checkoutForm.get('area')?.setValue(data.id);
    }
  }

  private fetchShippingCharge() {
    this.shippingService.getShippingCharge().subscribe(res => {
      this.shippingCharge.set((res.data as any)?.shippingCharge || 0);
    });
  }

  private fetchUserData() {
    this.userDataService.getLoggedInUserData().subscribe(res => {
      if (res && res.data) {
        const user = res.data;
        this.checkoutForm.patchValue({
          name: user.name,
          phoneNo: user.phoneNo
        });
      }
    });
  }

  onSubmit() {
    if (!this.checkoutForm.get('agreeTerms')?.value) {
      this.uiService.warn(this.translateService.instant('ln.AcceptTerms'));
      return;
    }

    if (this.checkoutForm.invalid) {
      this.uiService.warn(this.translateService.instant('ln.ProvideCorrectInfo'));
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.carts().length) {
      this.uiService.warn(this.translateService.instant('ln.CartEmptyMsg'));
      this.router.navigate(['/product-list']);
      return;
    }

    const formValue = this.checkoutForm.getRawValue();
    const selectDivision = this.divisions().find(d => d._id === formValue.division);
    const selectArea = this.areas().find(d => d._id === formValue.area);
    const isLoggedIn = this.userService.getUserStatus();

    const carts = isLoggedIn
      ? this.carts().map(m => m._id)
      : this.carts().map(m => (m.product as Product)._id);

    const cartData = isLoggedIn
      ? []
      : this.carts().map(m => ({
        ...m,
        product: (m.product as Product)._id
      }));

    const orderedItems = [
      ...this.buildPaidOrderItems(),
      ...this.buildComboFreeOrderItems(),
      ...this.buildComboGiftOrderItems(),
    ];

    const comboMeta = this.landingComboMeta;
    const regularProductsTotal = this.carts().reduce((acc, item) => {
      return acc + (this.pricePipe.transform(item.product as Product, 'regularPrice', item.selectedQty) as number);
    }, 0);

    let cartDiscountAmount = this.carts().reduce((acc, item) => {
      return acc + (this.pricePipe.transform(item.product as Product, 'discountAmount', item.selectedQty) as number);
    }, 0);

    if (comboMeta) {
      const comboSubTotal = this.landingComboCheckoutService.getComboSubTotal(comboMeta);
      cartDiscountAmount = Math.max(0, regularProductsTotal - comboSubTotal);
    }

    const deliveryCharge = this.hasComboFreeDelivery()
      ? 0
      : this.shippingCharge();

    const orderData = {
      name: formValue.name,
      phoneNo: formValue.phoneNo,
      shippingAddress: formValue.address,
      note: formValue.note,
      division: selectDivision,
      area: selectArea,
      zone: null,
      carts,
      cartData,
      paymentType: formValue.paymentMethod,
      country: 'bangladesh',
      paymentStatus: 'unpaid',
      orderStatus: OrderStatus.PENDING,
      orderedItems,
      orderFrom: comboMeta ? 'Landing Page' : 'Website',
      offerSummary: comboMeta
        ? this.landingComboCheckoutService.buildOfferSummary(comboMeta)
        : undefined,
      subTotal: this.subTotal(),
      deliveryCharge,
      discount: cartDiscountAmount.toFixed(2),
      totalSave: cartDiscountAmount,
      grandTotal: this.subTotal() + deliveryCharge - this.discount(),
      discountTypes: [{ productDiscount: cartDiscountAmount.toFixed(2) }],
      checkoutDate: this.utilsService.getDateString(new Date()),
      hasOrderTimeline: true,
      orderTimeline: {
        pending: {
          success: true,
          date: new Date(),
          expectedDate: new Date(),
        },
        confirmed: { success: false, date: null, expectedDate: null },
        processed: { success: false, date: null, expectedDate: null },
        shipped: { success: false, date: null, expectedDate: null },
        delivered: { success: false, date: null, expectedDate: null },
        canceled: { success: false, date: null, expectedDate: null },
        refunded: { success: false, date: null, expectedDate: null },
      },
    };

    this.isLoading.set(true);
    this.orderService.addOrder(orderData as any, isLoggedIn).subscribe({
      next: (res) => {
        if (!res.success) {
          this.uiService.warn(res.message || this.translateService.instant('ln.OrderFailed'));
          this.isLoading.set(false);
          return;
        }

        this.uiService.success(res.message || this.translateService.instant('ln.OrderAccepted'));
        this.landingComboCheckoutService.clear();
        this.reloadService.needRefreshCart$(false);
        if (!isLoggedIn) {
          this.cartService.deleteAllCartFromLocal(true);
          this.reloadService.needRefreshCart$(true);
        }

        this.trackPurchase(res.data);
        this.router.navigate(['/payment/success'], { queryParams: { orderId: res.data.orderId } });
        this.isLoading.set(false);
      },
      error: () => {
        this.uiService.wrong(this.translateService.instant('ln.OrderError'));
        this.isLoading.set(false);
      }
    });
  }

  private trackPurchase(order: any) {
    if (!order) return;
    const contents = this.carts().map(c => {
      const prod = c.product as any;
      return {
        id: prod._id,
        quantity: c.selectedQty,
        item_price: prod.salePrice
      };
    });

    const payload = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      eventId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      action_source: 'website',
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      custom_data: {
        value: this.subTotal() + this.shippingCharge(),
        currency: 'BDT',
        content_type: 'product',
        contents: contents,
        order_id: order.orderId || order._id
      }
    };

    if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
      this.gtmService.trackByFacebookPixel('Purchase', payload.custom_data, payload.eventId);
    }

    // Client-side Tiktok pixel
    this.gtmService.trackByTiktokPixel('PlaceAnOrder', {
      value: payload.custom_data.value,
      currency: 'BDT',
      content_type: 'product',
      contents: contents.map(c => ({
        content_id: c.id,
        quantity: c.quantity,
        price: c.item_price
      }))
    }, payload.eventId);

    this.gtmService.trackPurchase(payload as any).subscribe();
  }

  incrementQty(index: number) {
    const carts = [...this.carts()];
    if (carts[index]) {
      carts[index] = { ...carts[index], selectedQty: (carts[index].selectedQty || 1) + 1 };
      this.carts.set(carts);
      this.calculateSubTotal();
      if (!this.userService.getUserStatus()) {
        this.saveLocalCart(carts);
      }
    }
  }

  decrementQty(index: number) {
    const carts = [...this.carts()];
    if (carts[index] && (carts[index].selectedQty || 1) > 1) {
      carts[index] = { ...carts[index], selectedQty: (carts[index].selectedQty || 1) - 1 };
      this.carts.set(carts);
      this.calculateSubTotal();
      if (!this.userService.getUserStatus()) {
        this.saveLocalCart(carts);
      }
    }
  }

  removeItem(index: number) {
    const carts = [...this.carts()];
    carts.splice(index, 1);
    this.carts.set(carts);
    this.calculateSubTotal();
    if (!this.userService.getUserStatus()) {
      this.saveLocalCart(carts);
    }
  }

  private saveLocalCart(carts: Cart[]) {
    const raw = carts.map(c => ({
      product: typeof c.product === 'object' ? (c.product as any)?._id : c.product,
      selectedQty: c.selectedQty,
      cartType: c.cartType,
      specialPackage: c.specialPackage
    }));
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(raw));
  }

  private hasComboFreeDelivery(): boolean {
    return this.landingComboCheckoutService.hasFreeDelivery(this.landingComboMeta);
  }

  private buildPaidOrderItems() {
    return this.carts().map((m) => {
      const product = m.product as Product;
      return {
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
        quantity: m.selectedQty,
        orderType: 'regular',
        color: m.color ?? null,
        size: m.size ?? null,
      };
    });
  }

  private buildComboFreeOrderItems() {
    const freeBooks = this.landingComboMeta?.freeBooks ?? [];
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

  private buildComboGiftOrderItems() {
    const gifts = this.landingComboMeta?.freeGifts ?? [];
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
