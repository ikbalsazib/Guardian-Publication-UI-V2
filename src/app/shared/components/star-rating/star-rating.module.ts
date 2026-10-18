import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from './star-rating.component';
import {MaterialModule} from '../../../material/material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    StarRatingComponent
  ],
  declarations: [],
  exports: [
    StarRatingComponent,
  ]
})
export class StarRatingModule { }
