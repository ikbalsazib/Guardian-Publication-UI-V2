import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-poster-card-two',
  templateUrl: './poster-card-two.component.html',
  styleUrls: ['./poster-card-two.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PosterCardTwoComponent {
  @Input() data: any;
}
