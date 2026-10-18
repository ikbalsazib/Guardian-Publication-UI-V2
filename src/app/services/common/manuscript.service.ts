import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {Manuscript} from '../../interfaces/common/manuscript.interface';
import {FilterData} from '../../interfaces/gallery/filter-data';
import {Observable} from 'rxjs';

const API_NEW_EXPENSE = environment.apiBaseLink + '/api/manuscript/';

@Injectable({
  providedIn: 'root',
})
export class ManuscriptService {
  constructor(private httpClient: HttpClient) {
  }

  /**
   * addManuscript
   */

  addManuscript(data: Manuscript): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_NEW_EXPENSE + 'add', data);
  }





}
