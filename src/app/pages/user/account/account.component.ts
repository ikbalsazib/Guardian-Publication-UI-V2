import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { UserService } from 'src/app/services/common/user.service';
import { ReloadService } from 'src/app/services/core/reload.service';
import { UserDataService } from 'src/app/services/common/user-data.service';
import { User } from 'src/app/interfaces/common/user.interface';
import { SeoService } from 'src/app/services/core/seo.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class AccountComponent implements OnInit {
  // Signals
  user = signal<User | null>(null);
  isSidebarOpen = signal<boolean>(false);
  isUserLoggedIn = signal<boolean>(false);

  // Dependencies
  private userService = inject(UserService);
  private userDataService = inject(UserDataService);
  private reloadService = inject(ReloadService);
  private router = inject(Router);
  public translateService = inject(TranslateService);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({
      title: 'আমার অ্যাকাউন্ট - গার্ডিয়ান পাবলিকেশনস',
      noIndex: true
    });
    this.isUserLoggedIn.set(this.userService.getUserStatus());
    this.fetchUserData();

    this.reloadService.refreshData$.subscribe(() => this.fetchUserData());
  }

  private fetchUserData() {
    if (this.isUserLoggedIn()) {
      this.userDataService.getLoggedInUserData().subscribe(res => {
        this.user.set(res.data);
      });
    }
  }

  userLogOut() {
    this.userService.userLogOut();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
}
