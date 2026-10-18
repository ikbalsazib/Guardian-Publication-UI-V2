import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from '../../../../interfaces/common/category.interface';
import { HomeDataService } from '../../../../services/common/home-data.service';
import { SubCategoryService } from '../../../../services/common/sub-category.service';
import { SubCategory } from '../../../../interfaces/common/sub-category.interface';

@Component({
  selector: 'app-category-slide',
  templateUrl: './category-slide.component.html',
  styleUrls: ['./category-slide.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule
  ]
})
export class CategorySlideComponent {
  private readonly homeDataService = inject(HomeDataService);
  private readonly subCategoryService = inject(SubCategoryService);

  categories = toSignal(this.homeDataService.getMenuCategories(), {
    initialValue: [] as Category[]
  });
  toggleSub = signal<string | null>(null);
  categorySlide = signal(false);
  selectedCategory = signal<string | null>(null);
  selectedSubCategoryId = signal<string | null>(null);
  subCategories = signal<SubCategory[]>([]);

  private getSubCategoriesByCategoryId(id: string) {
    const mSelect = 'name  slug image priority readOnly createdAt category';
    this.subCategoryService
      .getSubCategoriesByCategoryId(id, mSelect)
      .subscribe({
        next: (res: { data: SubCategory[] }) => {
          this.subCategories.set(res.data);
          if (res.data.length === 0) {
            this.onHideCategory();
          }
        },
        error: (error: unknown) => {
          console.log(error);
        }
      });
  }

  onShowCategory() {
    this.categorySlide.set(true);
  }

  onHideCategory() {
    this.categorySlide.set(false);
    this.selectedCategory.set(null);
    this.toggleSub.set(null);
  }

  onHideCategoryMouseMove() {
    setTimeout(() => {
      if (this.categorySlide() && this.selectedCategory()) {
        this.categorySlide.set(false);
        this.selectedCategory.set(null);
      }
    }, 100);
  }

  showSub(id: string | undefined) {
    if (!id) {
      return;
    }
    this.selectedCategory.set(id);
    this.getSubCategoriesByCategoryId(id);
    this.toggleSub.update((current) => (current === id ? null : id));
  }

  onSelectSubCat(id: string | undefined) {
    if (!id) {
      return;
    }
    this.selectedSubCategoryId.set(id);
    this.onHideCategory();
  }
}
