import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LandingPage } from '../../interfaces/common/landing-page';

const API_LANDING_PAGE = environment.apiBaseLink + '/api/landing-page/';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private readonly httpClient = inject(HttpClient);

  getLandingPageBySlug(slug: string) {
    return this.httpClient.get<{ data: LandingPage; success: boolean; message?: string }>(
      API_LANDING_PAGE + 'get-by-slug/' + slug,
    );
  }

  submitLead(payload: { slug: string; name: string; phoneNo: string; email: string }) {
    return this.httpClient.post<{
      success: boolean;
      message?: string;
      data?: { downloadFileUrl?: string | null };
    }>(API_LANDING_PAGE + 'submit-lead', payload);
  }
}
