import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivitiesCardOneComponent } from './activities-card-one.component';

@NgModule({
  imports: [
    CommonModule,
    ActivitiesCardOneComponent
  ],
  declarations: [],
  exports: [
    ActivitiesCardOneComponent
  ]
})
export class ActivitiesCardOneModule { }
