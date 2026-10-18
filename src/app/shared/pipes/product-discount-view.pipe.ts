import {Pipe, PipeTransform} from '@angular/core';
import {DiscountTypeEnum} from '../../enum/product.enum';
import { Product } from '../../interfaces/common/product';

@Pipe({
  name: 'productDiscount',
  standalone: true
})
export class ProductDiscountViewPipe implements PipeTransform {

  transform(product: Product, type: string): string {

    if (product) {
      const discountAmount = product.discountAmount ?? 0;
      switch (type) {
        case 'default': {
          if (product.discountType === DiscountTypeEnum.PERCENTAGE) {
            return `${discountAmount}%`;
          } else if (product.discountType === DiscountTypeEnum.CASH) {
            return `${discountAmount}৳`;
          } else {
            return 'N/A'
          }
        }
        default: {
          return 'N/A'
        }
      }
    } else {
      return 'N/A'
    }

  }

}
