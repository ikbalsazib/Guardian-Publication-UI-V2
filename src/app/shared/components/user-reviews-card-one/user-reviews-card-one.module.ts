import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserReviewsCardOneComponent } from './user-reviews-card-one.component';
import {RouterLink} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    RouterLink,
    UserReviewsCardOneComponent
  ],
  declarations: [],
  exports: [
    UserReviewsCardOneComponent
  ]
})
export class UserReviewsCardOneModule { }
