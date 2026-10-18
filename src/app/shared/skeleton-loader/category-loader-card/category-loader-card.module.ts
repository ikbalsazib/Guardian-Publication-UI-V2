import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryLoaderCardComponent } from './category-loader-card.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    CategoryLoaderCardComponent
  ],
  exports: [
    CategoryLoaderCardComponent
  ]
})
export class CategoryLoaderCardModule { }
