import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule]
})
export class ConfirmOrderComponent {
  // Signals
  isOpen = signal<boolean>(false);
  orderId = signal<string | null>(null);

  onShowPop(id: string) {
    this.orderId.set(id);
    this.isOpen.set(true);
  }

  onHidePop() {
    this.isOpen.set(false);
  }
}
