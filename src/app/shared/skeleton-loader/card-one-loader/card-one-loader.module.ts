import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardOneLoaderComponent } from './card-one-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    CardOneLoaderComponent
  ],
  exports: [
    CardOneLoaderComponent
  ]
})
export class CardOneLoaderModule { }
