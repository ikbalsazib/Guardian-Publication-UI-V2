import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { Banner } from 'src/app/interfaces/common/banner.interface';
const API_BANNER = `${environment.apiBaseLink}/api/banner-carousel/`
@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * HTTP REQUEST HANDLE
   * getAllBanners()
   * getBannerById()
   */
  getAllBanners(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }

    return this.httpClient.post<{ data: Banner[], success: boolean, count: number }>(`${API_BANNER}get-all`, filterData, { params })
  }

  getBannerById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Banner;
      message: string;
      success: boolean;
    }>(API_BANNER + id, { params });
  }

}
