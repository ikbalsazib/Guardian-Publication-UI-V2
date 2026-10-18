import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarNotificationComponent } from '../../shared/dialog-view/ui/snackbar-notification/snackbar-notification.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private readonly snackBar = inject(MatSnackBar);

  constructor() { }

  /**
   * SNACKBAR
   */
  success(msg: any) {
    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      data: msg,
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['notification', 'success-snackbar']
    });
  }

  warn(msg: string) {
    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      data: msg,
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['notification', 'warn-snackbar']
    });
  }

  wrong(msg: string) {
    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      data: msg,
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['notification', 'wrong-snackbar']
    });
  }
}
