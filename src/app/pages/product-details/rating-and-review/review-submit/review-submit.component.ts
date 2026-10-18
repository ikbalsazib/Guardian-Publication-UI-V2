import { Component, Inject, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/core/ui.service';
import { UserService } from 'src/app/services/common/user.service';
import { UtilsService } from 'src/app/services/core/utils.service';
import { UserDataService } from 'src/app/services/common/user-data.service';
import { ReviewService } from 'src/app/services/common/review.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-review-submit',
  templateUrl: './review-submit.component.html',
  styleUrls: ['./review-submit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    StarRatingComponent
  ]
})
export class ReviewSubmitComponent implements OnInit, OnDestroy {
  // Signals
  rating = signal<number>(0);
  isSubmitting = signal<boolean>(false);

  // Form
  dataForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private uiService = inject(UiService);
  private userService = inject(UserService);
  private userDataService = inject(UserDataService);
  private utilsService = inject(UtilsService);
  private reviewService = inject(ReviewService);
  private dialogRef = inject(MatDialogRef<ReviewSubmitComponent>);
  public productId = inject(MAT_DIALOG_DATA);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    this.fetchUserInfo();
  }

  private initForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      review: [null, Validators.required],
    });
  }

  private fetchUserInfo() {
    if (this.userService.getUserStatus()) {
      const subU = this.userDataService.getLoggedInUserData().subscribe({
        next: (res) => {
          if (res?.data) {
            this.dataForm.patchValue({ name: res.data.name });
          }
        }
      });
      this.subscriptions.push(subU);
    }
  }

  onRatingChanged(rate: number) {
    this.rating.set(rate);
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn('Please fill all required fields');
      return;
    }
    if (this.rating() === 0) {
      this.uiService.warn('Please provide a rating');
      return;
    }

    this.isSubmitting.set(true);

    const reviewData = {
      ...this.dataForm.value,
      rating: this.rating(),
      reviewDate: this.utilsService.getDateString(new Date()),
      product: this.productId,
      status: false // Requires admin approval
    };

    const subAdd = this.reviewService.addReview(reviewData).subscribe({
      next: (res) => {
        this.uiService.success('Thank you! Your review is under moderation.');
        this.isSubmitting.set(false);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });

    this.subscriptions.push(subAdd);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
