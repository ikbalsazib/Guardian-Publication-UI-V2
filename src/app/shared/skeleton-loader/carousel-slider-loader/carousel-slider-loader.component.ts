import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-carousel-slider-loader',
  templateUrl: './carousel-slider-loader.component.html',
  styleUrls: ['./carousel-slider-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class CarouselSliderLoaderComponent {

}
