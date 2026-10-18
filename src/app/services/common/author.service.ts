import { Injectable } from '@angular/core';
import { Author } from 'src/app/interfaces/common/author.interface';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
import { AUTHORS } from 'src/app/core/db/author.db';
const API_AUTHOR = `${environment.apiBaseLink}/api/author/`
@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  allAuthor: Author[] = AUTHORS;

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * AUTHOR HTTP REQUEST
   * getAllAuthors() 
   * getSingleAuthorById()
   */
  getAllAuthors(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();

    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Author[], success: boolean, count: number }>(`${API_AUTHOR}get-all/`, filterData, { params });

  }
  getAuthorById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Author;
      message: string;
      success: boolean;
    }>(API_AUTHOR + id, { params });
  }

  getAuthorBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Author;
      message: string;
      success: boolean;
    }>(API_AUTHOR + 'get-by-slug/' + encodeURIComponent(slug), { params });
  }


  getSingleAuthorById(id: string | any) {
    if (id) {
      return this.allAuthor.find((author: Author) => author._id === id);
    } else {
      return null;
    }
  }


}
