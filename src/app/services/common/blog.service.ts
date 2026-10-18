import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Blog } from 'src/app/interfaces/common/blog.interface';
import { FilterData } from 'src/app/interfaces/gallery/filter-data';
const API_BLOGS = `${environment.apiBaseLink}/api/blog/`
@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(
    private httpClient: HttpClient
  ) { }

  /**
   * BLOG HTTP REQUEST
   * getAllBlogs()
   * getBlogById()
   */


  getAllBlog(filterData: FilterData, searchQuery?: any) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{
      data: Blog[];
      count: number;
      success: boolean;
      calculation: any;
    }>(API_BLOGS + 'get-all/', filterData, { params });
  }

  getBlogById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Blog;
      message: string;
      success: boolean;
    }>(API_BLOGS + id, { params });
  }

  getBlogBySlug(slug: string, select?: string) {
    const filterData: FilterData = {
      filter: { slug: slug },
      pagination: null,
      select: select ? { [select]: 1 } : { name: 1, image: 1, authorName: 1, shortDescEn: 1, nameEn: 1, mobileImage: 1, seoDescription: 1, seoKeywords: 1, description: 1, shortDesc: 1, priority: 1, totalView: 1, createdAt: 1, updatedAt: 1, slug: 1 }
    };
    return this.httpClient.post<{
      data: Blog[];
      count: number;
      success: boolean;
    }>(API_BLOGS + 'get-all/', filterData);
  }

  getAllBlogsCount(data: any) {
    return this.httpClient.post<{ success: boolean }>(API_BLOGS + 'blog-view-count', data);
  }
}
