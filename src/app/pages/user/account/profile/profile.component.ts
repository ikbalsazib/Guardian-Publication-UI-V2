import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserDataService } from '../../../../services/common/user-data.service';
import { ReloadService } from '../../../../services/core/reload.service';
import { User } from '../../../../interfaces/common/user.interface';
import { EditBasicInfoComponent } from '../../../../shared/dialog-view/ui/edit-basic-info/edit-basic-info.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  // Signals
  user = signal<User | null>(null);

  // Dependencies
  private userDataService = inject(UserDataService);
  private reloadService = inject(ReloadService);
  private dialog = inject(MatDialog);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.fetchUserData();
    const subReload = this.reloadService.refreshData$.subscribe(() => this.fetchUserData());
    this.subscriptions.push(subReload);
  }

  private fetchUserData() {
    this.userDataService.getLoggedInUserData().subscribe({
      next: (res) => {
        if (res) {
          this.user.set(res.data);
        }
      },
      error: (err) => console.log(err)
    });
  }

  openNewDialog() {
    this.dialog.open(EditBasicInfoComponent, {
      data: this.user(),
      panelClass: ['theme-dialog'],
      height: '60%',
      width: 'auto',
      autoFocus: false,
      disableClose: false
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
