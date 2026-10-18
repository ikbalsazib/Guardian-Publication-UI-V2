import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../services/core/seo.service';
import { OrderService } from '../../../services/common/order.service';
import { Order } from '../../../interfaces/common/order.interface';
import { EngBnNumPipe } from '../../../shared/pipes/eng-bn-num.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, TranslateModule]
})
export class PaymentStatusComponent implements OnInit {
  // Signals
  status = signal<'success' | 'fail' | 'cancel'>('success');
  orderId = signal<string | null>(null);

  // Dependencies
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private orderService = inject(OrderService);
  
  order = signal<Order | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({ title: 'Payment Status', noIndex: true });
    const path = this.route.snapshot.url[0]?.path;
    if (path.includes('success')) this.status.set('success');
    else if (path.includes('fail')) this.status.set('fail');
    else if (path.includes('cancel')) this.status.set('cancel');

    const queryOrderId = this.route.snapshot.queryParamMap.get('orderId');
    this.orderId.set(queryOrderId);

    if (queryOrderId) {
      this.fetchOrder(queryOrderId);
    }
  }

  private fetchOrder(id: string) {
    this.isLoading.set(true);
    this.orderService.getOrderByOrderId(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.order.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getInvoiceUrl(): string {
    const orderId = this.orderId();
    if (orderId) {
      return `${environment.apiBaseLink}/invoice/invoice-${orderId}.pdf`;
    }
    return '';
  }
}
