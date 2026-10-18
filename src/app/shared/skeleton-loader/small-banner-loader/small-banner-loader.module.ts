import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmallBannerLoaderComponent } from './small-banner-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    SmallBannerLoaderComponent
  ],
  exports: [
    SmallBannerLoaderComponent
  ]
})
export class SmallBannerLoaderModule { }
