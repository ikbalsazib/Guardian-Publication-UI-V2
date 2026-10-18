import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Order } from '../../../../interfaces/common/order.interface';
import { OrderStatus } from '../../../../enum/order.enum';
import { OrderService } from '../../../../services/common/order.service';

@Component({
  selector: 'app-order-track',
  templateUrl: './order-track.component.html',
  styleUrls: ['./order-track.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class OrderTrackComponent implements OnInit, OnDestroy {
  // Signals
  order = signal<Order | null>(null);
  isLoading = signal<boolean>(false);

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
    const sub = this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
