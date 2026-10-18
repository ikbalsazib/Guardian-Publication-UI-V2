import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PosterCardTwoComponent } from '../../../shared/components/poster-card-two/poster-card-two.component';

@Component({
  selector: 'app-poster',
  templateUrl: './poster.component.html',
  styleUrls: ['./poster.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, PosterCardTwoComponent]
})
export class PosterComponent {
  data = input<any>();
}
