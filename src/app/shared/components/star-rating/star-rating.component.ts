import { Component, input, output, OnInit, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class StarRatingComponent implements OnInit {
  // Inputs as signals
  rating = input<number>(0);
  starCount = input<number>(5);
  color = input<string>('accent');
  showRateText = input<boolean>(true);
  showSnackbar = input<boolean>(true);

  // Outputs
  ratingUpdated = output<number>();

  // Dependencies
  private readonly snackBar = inject(MatSnackBar);

  ratingArr: number[] = [];
  private snackBarDuration = 2000;

  ngOnInit() {
    this.ratingArr = [];
    for (let index = 0; index < this.starCount(); index++) {
      this.ratingArr.push(index);
    }
  }

  onClick(rating: number) {
    if (this.showSnackbar()) {
      this.snackBar.open('You rated ' + rating + ' / ' + this.starCount(), '', {
        duration: this.snackBarDuration
      });
    }
    this.ratingUpdated.emit(rating);
  }

  showIcon(index: number) {
    return this.rating() >= index + 1 ? 'star' : 'star_border';
  }

  get ratingColor(): string {
    if (!this.showRateText()) return 'black';
    const currentRating = this.rating();
    if (currentRating >= 5) return 'green';
    if (currentRating >= 4) return '#008BB4';
    if (currentRating >= 3) return 'orange';
    if (currentRating >= 2) return '#FF4078';
    if (currentRating >= 1) return '#FF5733';
    return 'black';
  }
}
