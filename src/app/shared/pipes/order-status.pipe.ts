import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../enum/order.enum';

@Pipe({
  name: 'orderStatus',
  standalone: true
})
export class OrderStatusPipe implements PipeTransform {
  transform(status: number): string {
    switch (status) {
      case OrderStatus.PENDING: return 'Pending';
      case OrderStatus.CONFIRM: return 'Approved';
      case OrderStatus.PROCESSING: return 'Processing';
      case OrderStatus.SHIPPING: return 'Shipped';
      case OrderStatus.DELIVERED: return 'Delivered';
      case OrderStatus.CANCEL: return 'Cancelled';
      case OrderStatus.REFUND: return 'Refund';
      case OrderStatus.NONE: return 'None';
      default: return '-';
    }
  }
}
