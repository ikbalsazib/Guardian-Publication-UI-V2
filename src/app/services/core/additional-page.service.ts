import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {AdditionalPage} from '../../interfaces/core/additional-page.interface';

const API_PAGE = environment.apiBaseLink + '/api/additional-page/';


@Injectable({
  providedIn: 'root'
})
export class AdditionalPageService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * getAdditionalPageBySlug
   */



  getAdditionalPageBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: AdditionalPage, message: string, success: boolean }>(API_PAGE + slug, {params});
  }





}
