import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, inject, signal, input } from '@angular/core';
import { Blog } from "../../../interfaces/common/blog.interface";
import { Review } from "../../../interfaces/common/review.interface";
import { Subscription } from "rxjs";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Pagination } from "../../../interfaces/core/pagination";
import { FilterData } from "../../../interfaces/gallery/filter-data";
import { BlogService } from "../../../services/common/blog.service";
import { isPlatformBrowser, CommonModule } from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import { CommentService } from 'src/app/services/common/comment.service';

@Component({
  selector: 'app-all-comments',
  templateUrl: './all-comments.component.html',
  styleUrls: ['./all-comments.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class AllCommentsComponent implements OnInit, OnDestroy {
  // Inputs
  blogId = input<string | null>(null);

  // Signals
  allComments = signal<Review[]>([]);
  isLoading = signal<boolean>(false);

  // Platform
  private platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  // Dependencies
  private commentService = inject(CommentService);
  private blogService = inject(BlogService);
  private activatedRoute = inject(ActivatedRoute);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (this.isBrowser) {
      if (this.blogId()) {
        this.fetchComments(this.blogId()!);
      } else {
        const subParam = this.activatedRoute.paramMap.subscribe(param => {
          const id = param.get('id');
          if (id) this.fetchComments(id);
        });
        this.subscriptions.push(subParam);
      }
    }
  }

  private fetchComments(id: string) {
    this.isLoading.set(true);
    const pagination: Pagination = { pageSize: 20, currentPage: 0 };
    const mSelect = {
      name: 1, user: 1, blog: 1, review: 1, images: 1,
      profileImg: 1, rating: 1, status: 1, reviewDate: 1,
      reply: 1, replyDate: 1
    };

    const filterData: FilterData = {
      pagination,
      filter: { 'blog._id': id, status: true },
      select: mSelect,
      sort: { createdAt: -1 }
    };

    const subC = this.commentService.getAllReviewsByQuery(filterData, null).subscribe({
      next: (res) => {
        this.allComments.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(subC);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
