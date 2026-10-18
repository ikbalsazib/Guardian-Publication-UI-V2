import { Injectable } from '@angular/core';
import { Product } from '../../interfaces/common/product';
import {
  LandingPageComboGift,
  LandingPageComboOffer,
} from '../../interfaces/common/landing-page';
import { DiscountTypeEnum } from '../../enum/product.enum';
import { getVisibleSalePrice } from '../../core/schema/utils/product-price.util';

const STORAGE_KEY = 'landingComboCheckout';

export interface LandingComboCheckoutMeta {
  landingPageSlug: string;
  comboTitle: string;
  pricingMode?: 'fixed' | 'discount';
  salePrice?: number;
  originalPrice?: number;
  discountType?: number;
  discountAmount?: number;
  buyOneGetOne?: boolean;
  freeDelivery?: boolean;
  freeBooks?: Product[];
  freeGifts?: LandingPageComboGift[];
  paidProducts?: Product[];
}

@Injectable({ providedIn: 'root' })
export class LandingComboCheckoutService {
  save(meta: LandingComboCheckoutMeta): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  }

  get(): LandingComboCheckoutMeta | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as LandingComboCheckoutMeta;
    } catch {
      return null;
    }
  }

  clear(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  buildMeta(
    slug: string,
    combo: LandingPageComboOffer,
  ): LandingComboCheckoutMeta {
    const paidProducts = [...(combo.products ?? [])];
    const freeBooks = [...(combo.freeBooks ?? [])];

    if (combo.buyOneGetOne && paidProducts[0]) {
      const bogoProduct = paidProducts[0];
      if (!freeBooks.some((book) => book._id === bogoProduct._id)) {
        freeBooks.push(bogoProduct);
      }
    }

    return {
      landingPageSlug: slug,
      comboTitle: combo.title || 'কম্বো অফার',
      pricingMode: combo.pricingMode || 'fixed',
      salePrice: combo.salePrice,
      originalPrice: combo.originalPrice,
      discountType: combo.discountType,
      discountAmount: combo.discountAmount,
      buyOneGetOne: !!combo.buyOneGetOne,
      freeDelivery: !!combo.freeDelivery,
      freeBooks,
      freeGifts: combo.freeGifts ?? [],
      paidProducts,
    };
  }

  getProductsSubTotal(products: Product[]): number {
    return products.reduce((sum, product) => sum + getVisibleSalePrice(product), 0);
  }

  getComboSubTotal(meta: LandingComboCheckoutMeta): number {
    const productsTotal = this.getProductsSubTotal(meta.paidProducts ?? []);

    if (meta.pricingMode === 'discount') {
      const amount = meta.discountAmount ?? 0;
      if (meta.discountType === DiscountTypeEnum.PERCENTAGE) {
        return Math.max(0, Math.floor(productsTotal - (amount / 100) * productsTotal));
      }
      if (meta.discountType === DiscountTypeEnum.CASH) {
        return Math.max(0, Math.floor(productsTotal - amount));
      }
      return productsTotal;
    }

    if (meta.salePrice != null && meta.salePrice >= 0) {
      return meta.salePrice;
    }

    return productsTotal;
  }

  hasFreeDelivery(meta: LandingComboCheckoutMeta | null): boolean {
    return !!meta?.freeDelivery;
  }

  buildOfferSummary(meta: LandingComboCheckoutMeta) {
    const appliedOffers = [
      meta.comboTitle,
      ...this.getBenefitLabelsFromMeta(meta),
    ].filter(Boolean);

    return {
      comboTitle: meta.comboTitle,
      landingPageSlug: meta.landingPageSlug,
      appliedOffers,
      freeDelivery: !!meta.freeDelivery,
      freeBookCount: meta.freeBooks?.length ?? 0,
      freeGiftCount: meta.freeGifts?.length ?? 0,
    };
  }

  private getBenefitLabelsFromMeta(meta: LandingComboCheckoutMeta): string[] {
    const labels: string[] = [];
    if (meta.buyOneGetOne) {
      labels.push('১টি কিনলে ১টি ফ্রি');
    }
    if (meta.pricingMode === 'discount') {
      if (meta.discountType === 1 && meta.discountAmount) {
        labels.push(`${meta.discountAmount}% ছাড়`);
      } else if (meta.discountType === 2 && meta.discountAmount) {
        labels.push(`৳${meta.discountAmount} ছাড়`);
      }
    } else if (
      meta.salePrice != null &&
      meta.originalPrice &&
      meta.originalPrice > meta.salePrice
    ) {
      const percent = Math.round(
        ((meta.originalPrice - meta.salePrice) / meta.originalPrice) * 100,
      );
      if (percent > 0) {
        labels.push(`${percent}% ছাড়`);
      }
    }
    if (meta.freeDelivery) {
      labels.push('ফ্রি ডেলিভারি');
    }
    if (meta.freeBooks?.length) {
      labels.push(`${meta.freeBooks.length}টি ফ্রি বই`);
    }
    if (meta.freeGifts?.length) {
      labels.push(`${meta.freeGifts.length}টি ফ্রি উপহার`);
    }
    return labels;
  }

  getBenefitLabels(combo: LandingPageComboOffer): string[] {
    const labels: string[] = [];

    if (combo.buyOneGetOne) {
      labels.push('১টি কিনলে ১টি ফ্রি');
    }
    if (combo.pricingMode === 'discount') {
      if (combo.discountType === DiscountTypeEnum.PERCENTAGE && combo.discountAmount) {
        labels.push(`${combo.discountAmount}% ছাড়`);
      } else if (combo.discountType === DiscountTypeEnum.CASH && combo.discountAmount) {
        labels.push(`৳${combo.discountAmount} ছাড়`);
      }
    } else if (combo.salePrice != null && combo.originalPrice && combo.originalPrice > combo.salePrice) {
      const percent = Math.round(
        ((combo.originalPrice - combo.salePrice) / combo.originalPrice) * 100,
      );
      if (percent > 0) {
        labels.push(`${percent}% ছাড়`);
      }
    }
    if (combo.freeDelivery) {
      labels.push('ফ্রি ডেলিভারি');
    }
    if (combo.freeBooks?.length) {
      labels.push(`${combo.freeBooks.length}টি ফ্রি বই`);
    }
    if (combo.freeGifts?.length) {
      labels.push(`${combo.freeGifts.length}টি ফ্রি উপহার`);
    }

    return labels;
  }
}
