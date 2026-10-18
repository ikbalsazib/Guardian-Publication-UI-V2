import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShopeCategoryCardComponent } from './shope-category-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ShopeCategoryCardComponent
  ],
  declarations: [],
  exports: [
    ShopeCategoryCardComponent
  ]
})
export class ShopeCategoryCardModule { }
