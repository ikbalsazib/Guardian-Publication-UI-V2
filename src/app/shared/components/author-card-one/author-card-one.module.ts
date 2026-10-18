import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthorCardOneComponent } from './author-card-one.component';

@NgModule({
  imports: [
    CommonModule,
    AuthorCardOneComponent
  ],
  declarations: [],
  exports: [
    AuthorCardOneComponent
  ]
})
export class AuthorCardOneModule { }
