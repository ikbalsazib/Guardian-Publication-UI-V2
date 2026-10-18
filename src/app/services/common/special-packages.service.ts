import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SpecialPackage } from 'src/app/interfaces/common/special-package.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { Product } from "../../interfaces/common/product";
const API_SPECIAL_PACKAGE = environment.apiBaseLink + '/api/special-package/';
const API_PRODUCT = environment.apiBaseLink + '/api/product/';

@Injectable({
  providedIn: 'root'
})
export class SpecialPackagesService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * SPECIAL PACKAGE HTTP REQUEST
   * getAllSpecialPackages()
   * getSpecialPackageById()
   */

  getAllSpecialPackages(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: SpecialPackage[], count: number, success: boolean }>(API_SPECIAL_PACKAGE + 'get-all', filterData, { params });
  }

  getSpecialPackageById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: SpecialPackage, message: string, success: boolean }>(API_SPECIAL_PACKAGE + id, { params });
  }

  getRelatedProductsByMultiCategoryId(data: { ids: any, limit: number }) {
    let params = new HttpParams();
    // if (searchQuery) {
    //   params = params.append('q', searchQuery);
    // }
    return this.httpClient.post<{ data: Product[], count: number, success: boolean }>(API_PRODUCT + 'get-related-products-by-category-ids', data);
  }

  getProductByIds(ids: string[], select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.post<{ data: Product[], count: number, success: boolean }>(API_SPECIAL_PACKAGE + 'get-products-by-ids', { ids }, { params });
  }

  getSpecialPackageBySlug(slug: string, select?: any) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: SpecialPackage, message: string, success: boolean }>(API_SPECIAL_PACKAGE + 'slug/' + slug, { params });
  }

}
