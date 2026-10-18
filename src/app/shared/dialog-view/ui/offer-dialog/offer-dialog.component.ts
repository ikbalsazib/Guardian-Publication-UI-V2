import { CommonModule } from '@angular/common';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import {Popup} from "../../../../interfaces/common/popup.interface";
import {StorageService} from "../../../../services/core/storage.service";

@Component({
  selector: 'app-offer-dialog',
  templateUrl: './offer-dialog.component.html',
  styleUrls: ['./offer-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, RouterModule]
})
export class OfferDialogComponent implements OnInit {
  popups: Popup[] = [];
  filter: any = null;

  constructor(
    private storageService: StorageService,
    private dialogRef: MatDialogRef<OfferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Popup[],
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.length) {
      this.popups = this.data;
    }
  }

  onClose(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.dialogRef.close();
    this.storageService.storeDataToSessionStorage('DIALOG', true);
  }
}
