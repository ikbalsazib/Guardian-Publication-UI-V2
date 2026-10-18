import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog-with-check.component.html',
  styleUrls: ['./confirm-dialog-with-check.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatCheckboxModule
  ]
})
export class ConfirmDialogWithCheckComponent implements OnInit {

  public isChecked: boolean = false;
  public showCheck: boolean = false;
  public checkMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogWithCheckComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data) {
      if (this.data.showCheck) {
        this.showCheck = this.data.showCheck;
        this.checkMessage = this.data.checkMessage ? this.data.checkMessage : '';
        this.isChecked = this.data.initialCheck ? this.data.initialCheck : false;
      }
    }
  }

  onConfirm(): void {
    this.dialogRef.close({
      isConfirm: true,
      isChecked: this.isChecked
    });
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
