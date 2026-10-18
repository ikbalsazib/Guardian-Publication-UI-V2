import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Setting } from '../../interfaces/common/setting.interface';

const API_SETTING = environment.apiBaseLink + '/api/setting/';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(
    private httpClient: HttpClient
  ) { }

  getSetting(select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{ data: Setting, message: string, success: boolean }>(API_SETTING + 'get-setting', { params });
  }

}
