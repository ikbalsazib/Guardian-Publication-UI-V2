import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ResponsePayload} from '../../interfaces/core/response-payload.interface';
import {Otp} from '../../interfaces/common/otp.interface';

const API_OTP = environment.apiBaseLink + '/api/otp/';


@Injectable({
  providedIn: 'root'
})
export class OtpService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * validateOtpWithPhoneNo()
   */


  validateOtpWithPhoneNo(data: { phoneNo: string, code: string }) {
    return this.httpClient.post<ResponsePayload>
    (API_OTP + 'validate-otp', data);
  }

  generateOtpWithPhoneNo(phoneNo: string) {
    return this.httpClient.post<ResponsePayload>
    (API_OTP + 'generate-otp', { phoneNo });
  }

  validateOtpWithEmail(data: { email: string, code: string }) {
    return this.httpClient.post<ResponsePayload>
    (API_OTP + 'validate-otp-with-email', data);
  }

  generateOtpWithEmail(email: string) {
    return this.httpClient.post<ResponsePayload>
    (API_OTP + 'generate-otp-with-email', {email});
  }

}
