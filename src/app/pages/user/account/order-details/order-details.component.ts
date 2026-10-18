import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';


import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { OrderStatus } from '../../../../enum/order.enum';
import { Order } from '../../../../interfaces/common/order.interface';
import { OrderService } from '../../../../services/common/order.service';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    EngBnNumPipe,
    MatButtonModule,
    MatDividerModule
  ]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  // Signals
  order = signal<Order | null>(null);
  isLoading = signal<boolean>(false);
  estimatedDeliveryDate = computed(() => {
    const checkoutDate = this.order()?.checkoutDate;
    if (!checkoutDate) {
      return null;
    }
    const date = new Date(checkoutDate);
    date.setDate(date.getDate() + 3);
    return date;
  });
  
  // Public Enums for Template
  public OrderStatusEnum = OrderStatus;

  // Dependencies
  private orderService = inject(OrderService);
  private activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subRoute = this.activatedRoute.paramMap.subscribe(params => {
      const orderId = params.get('orderId');
      if (orderId) {
        this.fetchOrderDetails(orderId);
      }
    });
    this.subscriptions.push(subRoute);
  }

  private fetchOrderDetails(orderId: string) {
    this.isLoading.set(true);
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getTimelineStatus(status: OrderStatus): boolean {
    const o = this.order();
    if (!o || !o.orderTimeline) return false;

    switch(status) {
      case OrderStatus.PENDING: return true; // Always true if order exists
      case OrderStatus.CONFIRM: return !!o.orderTimeline.confirmed?.success;
      case OrderStatus.PROCESSING: return !!o.orderTimeline.processed?.success;
      case OrderStatus.SHIPPING: return !!o.orderTimeline.shipped?.success;
      case OrderStatus.DELIVERED: return !!o.orderTimeline.delivered?.success;
      case OrderStatus.CANCEL: return !!o.orderTimeline.canceled?.success;
      case OrderStatus.REFUND: return !!o.orderTimeline.refunded?.success;
      default: return false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
