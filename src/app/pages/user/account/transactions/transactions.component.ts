import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { FilterData } from '../../../../interfaces/gallery/filter-data';
import { Order } from '../../../../interfaces/common/order.interface';
import { OrderService } from '../../../../services/common/order.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { EngBnNumPipe } from '../../../../shared/pipes/eng-bn-num.pipe';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatTableModule,
    EngBnNumPipe
  ]
})
export class TransactionsComponent implements OnInit, OnDestroy {
  // Signals
  transactions = signal<Order[]>([]);
  isLoading = signal<boolean>(false);

  // Dependencies
  private orderService = inject(OrderService);
  private reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.fetchTransactions();
    });
    this.subscriptions.push(subReload);

    this.fetchTransactions();
  }

  private fetchTransactions() {
    const filter: FilterData = {
      filter: { orderStatus: 5 }, // Delivered/Completed status usually signifies a completed transaction
      select: { orderId: 1, grandTotal: 1, orderStatus: 1, createdAt: 1, paymentType: 1 },
      sort: { createdAt: -1 },
      pagination: null
    };

    this.isLoading.set(true);
    const sub = this.orderService.getOrdersByUser(filter).subscribe({
      next: (res) => {
        this.transactions.set(res.data);
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
