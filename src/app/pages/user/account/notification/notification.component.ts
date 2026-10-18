import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterData } from '../../../../interfaces/gallery/filter-data';
import { NotificationService } from '../../../../services/common/notification.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { UiService } from '../../../../services/core/ui.service';
import { PipesModule } from '../../../../shared/pipes/pipes.module';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PipesModule,
    SafeHtmlPipe
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  // Signals
  notifications = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  // Dependencies
  private notificationService = inject(NotificationService);
  private uiService = inject(UiService);
  private reloadService = inject(ReloadService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const subReload = this.reloadService.refreshData$.subscribe(() => {
      this.fetchNotifications();
    });
    this.subscriptions.push(subReload);

    this.fetchNotifications();
  }

  private fetchNotifications() {
    const filter: FilterData = {
      filter: null,
      select: { name: 1, description: 1, createdAt: 1, image: 1, isReadNoti: 1 },
      sort: { createdAt: -1 },
      pagination: null
    };

    this.isLoading.set(true);
    const sub = this.notificationService.getAllNotifications(filter, null).subscribe({
      next: (res) => {
        this.notifications.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
    this.subscriptions.push(sub);
  }

  updateNotification(id: string, status: boolean) {
    this.notificationService.updateNotificationById(id, { isReadNoti: status }).subscribe({
      next: (res) => {
        this.uiService.success(res.message);
        this.fetchNotifications();
        this.reloadService.needRefreshData$();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
