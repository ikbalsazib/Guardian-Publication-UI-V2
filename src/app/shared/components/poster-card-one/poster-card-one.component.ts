import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-poster-card-one',
  templateUrl: './poster-card-one.component.html',
  styleUrls: ['./poster-card-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PosterCardOneComponent {
  @Input() data: any;
}
