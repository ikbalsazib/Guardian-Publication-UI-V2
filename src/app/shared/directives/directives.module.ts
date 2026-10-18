import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyLoadDirective} from './image-lazy-load';
import {ImageLoadErrorDirective} from './image-load-error.directive';

@NgModule({
  imports: [
    CommonModule,
    LazyLoadDirective,
    ImageLoadErrorDirective
  ],
  declarations: [],
  exports: [LazyLoadDirective, ImageLoadErrorDirective]
})
export class DirectivesModule { }
