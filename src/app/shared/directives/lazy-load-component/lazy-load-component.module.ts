import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LazyLoadComponentDirective} from './lazy-load-component.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LazyLoadComponentDirective
  ],
  exports: [
    LazyLoadComponentDirective
  ]
})
export class LazyLoadComponentModule { }
