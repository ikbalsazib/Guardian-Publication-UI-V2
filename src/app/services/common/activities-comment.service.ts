import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Comment } from '../../interfaces/common/comment.interface';
import { FilterData } from '../../interfaces/gallery/filter-data';
import { ResponsePayload } from "../../interfaces/core/response-payload.interface";
import { Review } from "../../interfaces/common/review.interface";


const API_REVIEW_CONTROL = environment.apiBaseLink + '/api/activities-comment/';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesCommentService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addComment
   */

  addComment(data: Comment) {
    return this.httpClient.post<ResponsePayload>
      (API_REVIEW_CONTROL + 'add', data);
  }

  getAllReviewsByQuery(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_REVIEW_CONTROL + 'get-all-activitiesComment-by-query', filterData, { params });
  }
}
