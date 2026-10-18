import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Newsletter } from 'src/app/interfaces/common/newsletter.interface';
import { Observable } from 'rxjs';
import { ResponsePayload } from 'src/app/interfaces/core/response-payload.interface';
const API_NEWS_LETTER = `${environment.apiBaseLink}/api/newsletter/`
@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * HTTP REQUEST
   * addNewsletter()
   */
  addNewsletter(data: Newsletter): Observable<ResponsePayload> {
    return this.httpClient.post<ResponsePayload>(API_NEWS_LETTER + 'add', data);
  }

}
