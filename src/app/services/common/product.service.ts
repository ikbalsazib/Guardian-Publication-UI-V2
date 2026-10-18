import { Injectable } from '@angular/core';
import { Product } from 'src/app/interfaces/common/product';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { UiService } from "../core/ui.service";
import { ReloadService } from "../core/reload.service";

const API_PRODUCT = `${environment.apiBaseLink}/api/product/`

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private httpClient: HttpClient,
    private uiService: UiService,
    private reloadService: ReloadService,

  ) { }



  /**
   * PRODUCT HTTP REQUEST
   * getAllProducts()
   * getProductById()
  */
  getAllProducts(filter: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }

    return this.httpClient.post<{ data: Product[], success: string, count: number }>(`${API_PRODUCT}get-all/`, filter, { params });

  }

  // getAllProducts(filterData: FilterData, searchQuery?: string) {
  //   let params = new HttpParams();
  //   if (searchQuery) {
  //     params = params.append('q', searchQuery);
  //   }
  //   return this.httpClient.post<{ data: Product[], count: number, success: boolean }>(API_PRODUCT + 'get-all', filterData, {params});
  // }

  getProductById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Product, message: string, success: boolean }>(API_PRODUCT + id, { params });
  }

  getProductByIds(ids: string[], select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.post<{ data: Product[], count: number, success: boolean }>(API_PRODUCT + 'get-products-by-ids', { ids }, { params });
  }


  getProductBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Product,
      message: string,
      redirectTo: string,
      success: boolean
    }>(API_PRODUCT + 'get-by-slug/' + encodeURIComponent(slug), { params });
  }

  /**
   * COMPARE LIST with LOCAL STORAGE
   */

  addToCompare(productId: string, categoryId?: string) {
    // console.log(product);
    const rawData = localStorage.getItem('compareListV2');
    const items = rawData ? JSON.parse(rawData) : null;
    let compareListV2;
    if (items === null) {
      compareListV2 = [];
      compareListV2.push({ _id: productId, category: categoryId });
      this.uiService.success('Product added to compare list');
      this.reloadService.needRefreshCompareList$();
    } else {
      compareListV2 = items;
      const fIndex = compareListV2.findIndex((o: any) => o._id === productId);
      const fIndexCat = compareListV2.findIndex((o: any) => o.category === categoryId);
      if (fIndex === -1) {
        if (compareListV2.length !== 3) {
          if (fIndexCat === -1) {
            this.uiService.wrong('Please add same category product to compare');
          } else {
            compareListV2.push({ _id: productId, category: categoryId });
            this.uiService.success('Product added to compare list');
            this.reloadService.needRefreshCompareList$();
          }

        }
        else {
          this.uiService.wrong('Your compare list is full');
        }
      } else {
        this.uiService.warn('This product already in compare list');
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('compareListV2', JSON.stringify(compareListV2));
    }
  }


  getCompareList(): string[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const list = localStorage.getItem('compareListV2');
    if (list === null) {
      return [];
    }
    return JSON.parse(list) as any[];
  }

  deleteCompareItem(id: string) {
    if (typeof localStorage === 'undefined') return;
    const rawData = localStorage.getItem('compareListV2');
    const items = rawData ? JSON.parse(rawData) : null;
    if (items) {
      const filtered = items.filter((el: any) => el._id !== id);
      if (filtered && filtered.length) {
        localStorage.setItem('compareListV2', JSON.stringify(filtered));
      } else {
        localStorage.removeItem('compareListV2');
      }
    }
  }

}
