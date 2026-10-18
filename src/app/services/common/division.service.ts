import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {Division} from '../../interfaces/common/division.interface';
import {FilterData} from "../../interfaces/gallery/filter-data";


const API_URL = environment.apiBaseLink + '/api/division/';


@Injectable({
  providedIn: 'root'
})
export class DivisionService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addDivision()
   * getAllDivisions()
   * getDivisionById()
   */

  addDivision(data: Division) {
    return this.httpClient.post<ResponsePayload>
    (API_URL + 'add', data);
  }

  getAllDivisions(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Division[], count: number, success: boolean }>(API_URL + 'get-all', filterData, {params});
  }

  getDivisionById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Division, message: string, success: boolean }>(API_URL + id, {params});
  }


}
