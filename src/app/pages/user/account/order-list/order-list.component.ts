import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { OrderStatusPipe } from '../../../../shared/pipes/order-status.pipe';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';
import { FilterData } from '../../../../interfaces/gallery/filter-data';
import { Order } from '../../../../interfaces/common/order.interface';
import { OrderService } from '../../../../services/common/order.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatMenuModule,
    MatButtonModule,
    OrderStatusPipe,
    EngBnNumPipe
  ]
})
export class OrderListComponent implements OnInit, OnDestroy {
  // Signals
  allOrders = signal<Order[]>([]);
  isLoading = signal<boolean>(false);
  selectedStatus = signal<string>('Select Any');

  // Dependencies
  private orderService = inject(OrderService);
  private reloadService = inject(ReloadService);
  private uiService = inject(UiService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.fetchOrders();

    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.fetchOrders();
    });
    this.subscriptions.push(subReload);
  }

  fetchOrders(filter?: any) {
    this.isLoading.set(true);
    const mSelect = {
      orderId: 1, paymentType: 1, grandTotal: 1,
      orderStatus: 1, orderedItems: 1, createdAt: 1
    };

    const filterData: FilterData = {
      select: mSelect,
      pagination: null,
      sort: { createdAt: -1 },
      filter: filter || null
    };

    const subOrders = this.orderService.getOrdersByUser(filterData).subscribe({
      next: (res) => {
        if (res.success) {
          this.allOrders.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });

    this.subscriptions.push(subOrders);
  }

  cancelOrder(id: string) {
    this.orderService.updateOrderById(id, { orderStatus: 6 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.success('Order cancelled successfully');
          this.reloadService.needRefreshData$();
        }
      }
    });
  }

  onFilterStatus(label: string, status: number) {
    this.selectedStatus.set(label);
    this.fetchOrders({ orderStatus: status });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
