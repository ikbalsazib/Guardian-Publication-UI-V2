import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {Contact} from '../../interfaces/common/contact.interface';


const API_CONTACT = environment.apiBaseLink + '/api/contact/';


@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addContact
   */

  addContact(data: Contact) {
    return this.httpClient.post<ResponsePayload>
    (API_CONTACT + 'add', data);
  }

}
