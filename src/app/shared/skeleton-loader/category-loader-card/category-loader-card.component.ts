import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-category-loader-card',
  templateUrl: './category-loader-card.component.html',
  styleUrls: ['./category-loader-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class CategoryLoaderCardComponent {

}
