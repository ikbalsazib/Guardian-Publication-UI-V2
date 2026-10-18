import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselSliderLoaderComponent } from './carousel-slider-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    CarouselSliderLoaderComponent
  ],
  exports: [
    CarouselSliderLoaderComponent
  ]
})
export class CarouselSliderLoaderModule { }
