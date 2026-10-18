import {Pipe, PipeTransform} from '@angular/core';
import { DiscountTypeEnum } from '../../enum/product.enum';
import { Product } from '../../interfaces/common/product';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {

  transform(product: Product, type: string, quantity?: number): number {

    if (product) {
      let discountAmount = product.discountAmount ?? 0;
      let discountType = product.discountType;

      if (product.offerDiscountAmount && product.offerDiscountAmount > 0) {
        discountAmount = product.offerDiscountAmount;
        discountType = product.offerDiscountType;
      }

      const salePrice = product.salePrice ?? 0;

      switch (type) {
        case 'salePrice': {

          if (discountType == DiscountTypeEnum.PERCENTAGE) {
            const disPrice = (discountAmount / 100) * salePrice;

            if (quantity) {
              return Math.floor((salePrice - disPrice) * quantity);
            }
            return Math.floor(salePrice - disPrice);
          } else if (discountType == DiscountTypeEnum.CASH) {
            if (quantity) {
              return Math.floor((salePrice - discountAmount) * quantity);
            }
            return Math.floor(salePrice - discountAmount);
          } else {
            if (quantity) {
              return Math.floor((salePrice) * quantity);
            }
            return Math.floor(salePrice);
          }
        }
        case 'discountAmount': {
          if (discountType == DiscountTypeEnum.PERCENTAGE) {
            if (quantity) {
              return ((discountAmount / 100) * salePrice) * quantity;
            }
            return ((discountAmount / 100) * salePrice);
          } else if (discountType == DiscountTypeEnum.CASH) {
            if (quantity) {
              return discountAmount * quantity;
            }
            return discountAmount;
          } else {
            return 0;
          }
        }
        case 'discountPercentage': {
          if (discountType == DiscountTypeEnum.PERCENTAGE) {
            return discountAmount;
          } else if (discountType == DiscountTypeEnum.CASH) {
            if (salePrice > 0) {
              return Math.round((discountAmount / salePrice) * 100);
            }
            return 0;
          } else {
            return 0;
          }
        }
        case 'regularPrice': {
          if (quantity) {
            return Math.floor(salePrice * quantity);
          }
          return Math.floor(salePrice);
        }
        default: {
          return salePrice;
        }
      }
    } else {
      return 0;
    }

  }

}
