import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from 'src/app/interfaces/common/category.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { environment } from 'src/environments/environment';
const API_CATEGORY = `${environment.apiBaseLink}/api/category/`
@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /***
   * CATEGGORY HTTP REQUEST
   * getAllCategory()
   * getCategoryById()
   */
  getAllCategory(filterData?: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }

    return this.httpClient.post<{ data: Category[], count: number, success: boolean }>(API_CATEGORY + 'get-all/', filterData, { params });
  }

  getCategoryById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Category, message: string, success: boolean }>(API_CATEGORY + id, { params });
  }


}
