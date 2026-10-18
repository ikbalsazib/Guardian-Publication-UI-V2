import { CommonModule } from '@angular/common';
import {Component, Input} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Category } from '../../../interfaces/common/category.interface';

@Component({
  selector: 'app-shope-category-card',
  templateUrl: './shope-category-card.component.html',
  styleUrls: ['./shope-category-card.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ShopeCategoryCardComponent {
  @Input() data!: Category;
}
