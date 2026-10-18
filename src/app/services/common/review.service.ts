import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Review } from '../../interfaces/common/review.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
const API_REVIEW_CONTROL = environment.apiBaseLink + '/api/review/';


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addReview
   * deleteReviewByReviewId
   * getAllReviewsByQuery
   */

  addReview(data: Review) {
    return this.httpClient.post<{ message: string }>(API_REVIEW_CONTROL + 'add', data);
  }
  getReviewByUserId() {
    return this.httpClient.get<{ data: Review[], success: boolean }>(API_REVIEW_CONTROL + 'get-Review-by-user');
  }

  deleteReviewByReviewId(id: string) {
    return this.httpClient.delete<{ message?: string }>(API_REVIEW_CONTROL + 'delete-loggedin-user-review/' + id);
  }

  getAllReviewsByQuery(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_REVIEW_CONTROL + 'get-all-review-by-query', filterData, { params });
  }


}
