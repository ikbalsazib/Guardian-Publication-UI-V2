import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialPackageLoaderComponent } from './special-package-loader.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    SpecialPackageLoaderComponent
  ],
  exports: [
    SpecialPackageLoaderComponent
  ]
})
export class SpecialPackageLoaderModule { }
