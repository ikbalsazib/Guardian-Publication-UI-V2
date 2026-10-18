import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { Comment } from '../../interfaces/common/comment.interface';
import { FilterData } from "../../interfaces/gallery/filter-data";
import { Review } from "../../interfaces/common/review.interface";


const API_CONTACT = environment.apiBaseLink + '/api/comment/';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  /**
   * addComment
   */

  addComment(data: Comment) {
    return this.httpClient.post<ResponsePayload>
      (API_CONTACT + 'add', data);
  }

  getAllReviewsByQuery(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Review[], count: number, success: boolean }>(API_CONTACT + 'get-all-blogComment-by-query', filterData, { params });
  }

}
