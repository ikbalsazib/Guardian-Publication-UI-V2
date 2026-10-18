import { DiscountTypeEnum } from '../../../enum/product.enum';
import { Product } from '../../../interfaces/common/product';

/** Matches visible purchasable price from PricePipe (salePrice type). */
export function getVisibleSalePrice(product: Product): number {
  let discountAmount = product.discountAmount ?? 0;
  let discountType = product.discountType;

  if (product.offerDiscountAmount && product.offerDiscountAmount > 0) {
    discountAmount = product.offerDiscountAmount;
    discountType = product.offerDiscountType;
  }

  const salePrice = product.salePrice ?? 0;

  if (discountType === DiscountTypeEnum.PERCENTAGE) {
    const disPrice = (discountAmount / 100) * salePrice;
    return Math.floor(salePrice - disPrice);
  }

  if (discountType === DiscountTypeEnum.CASH) {
    return Math.floor(salePrice - discountAmount);
  }

  return Math.floor(salePrice);
}
