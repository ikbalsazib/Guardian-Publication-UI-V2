import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Banner } from '../../../interfaces/common/banner.interface';

@Component({
  selector: 'app-carousel-banner-one',
  templateUrl: './carousel-banner-one.component.html',
  styleUrls: ['./carousel-banner-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CarouselBannerOneComponent {
  @Input() data?: Banner;
}
