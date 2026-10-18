import { Component, OnInit, OnDestroy, signal, inject, input, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CategoryCardOneComponent } from '../../../shared/components/category-card-one/category-card-one.component';
import { CategoryLoaderCardComponent } from '../../../shared/skeleton-loader/category-loader-card/category-loader-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Category } from '../../../interfaces/common/category.interface';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../../services/common/category.service';
import { FilterData } from '../../../interfaces/gallery/filter-data';

@Component({
  selector: 'app-shop-by-category',
  templateUrl: './shop-by-category.component.html',
  styleUrls: ['./shop-by-category.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CategoryCardOneComponent,
    CategoryLoaderCardComponent,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShopByCategoryComponent implements OnInit, OnDestroy {
  categoriesData = input<Category[]>([]);
  isLoading = input<boolean>(false);

  categories = signal<Category[]>([]);
  isLoadingCategoryMenu = signal<boolean>(false);

  language = 'bn';

  private categoryService = inject(CategoryService);
  public translateService = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);
  private subscriptions: Subscription[] = [];

  constructor() {
    effect(() => {
      const data = this.categoriesData();
      if (data.length > 0) {
        this.categories.set(data);
        this.isLoadingCategoryMenu.set(false);
      } else if (!this.isLoading()) {
        this.isLoadingCategoryMenu.set(false);
      } else {
        this.isLoadingCategoryMenu.set(this.isLoading());
      }
    });
  }

  ngOnInit(): void {
    const sub = this.activatedRoute.queryParamMap.subscribe(qPram => {
      this.language = qPram.get('language') || 'bn';
    });
    this.subscriptions.push(sub);

    if (this.categoriesData().length === 0 && !this.isLoading()) {
      this.getAllCategory();
    }
  }

  getAllCategory() {
    const filter: FilterData = {
      filter: null,
      select: { _id: 1, name: 1, nameEn: 1, slug: 1, image: 1, mobileImage: 1 },
      pagination: { pageSize: 15, currentPage: 0 },
      sort: { serial: 1 }
    };

    this.isLoadingCategoryMenu.set(true);
    const sub = this.categoryService.getAllCategory(filter, null).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories.set(res.data);
        }
        this.isLoadingCategoryMenu.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoadingCategoryMenu.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
