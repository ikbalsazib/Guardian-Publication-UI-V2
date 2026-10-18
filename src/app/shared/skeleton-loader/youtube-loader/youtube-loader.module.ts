import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YoutubeLoaderComponent } from './youtube-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    YoutubeLoaderComponent
  ],
  exports: [
    YoutubeLoaderComponent
  ]
})
export class YoutubeLoaderModule { }
