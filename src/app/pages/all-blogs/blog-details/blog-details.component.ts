import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Meta, Title } from '@angular/platform-browser';
import { Blog } from '../../../interfaces/common/blog.interface';
import { BlogService } from '../../../services/common/blog.service';
import { CommentService } from '../../../services/common/comment.service';
import { UserService } from '../../../services/common/user.service';
import { UiService } from '../../../services/core/ui.service';
import { SocialShareComponent } from '../../../shared/dialog-view/ui/social-share/social-share.component';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html.pipe';
import { SeoService } from '../../../services/core/seo.service';
import { SeoInternalLinksComponent } from '../../../shared/components/seo-internal-links/seo-internal-links.component';


@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    SafeHtmlPipe,
    SeoInternalLinksComponent
  ]
})
export class BlogDetailsComponent implements OnInit, OnDestroy {
  // Signals
  blog = signal<Blog | null>(null);
  recentBlogs = signal<Blog[]>([]);
  isLoading = signal<boolean>(false);

  // Form
  commentForm!: FormGroup;

  // Dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);
  private commentService = inject(CommentService);
  private userService = inject(UserService);
  private uiService = inject(UiService);
  private dialog = inject(MatDialog);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    const subRoute = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchBlogDetails(slug);
      }
    });
    this.subscriptions.push(subRoute);
    this.fetchRecentBlogs();
  }

  private initForm() {
    this.commentForm = this.fb.group({
      review: ['', Validators.required]
    });
  }

  private fetchBlogDetails(slug: string) {
    this.isLoading.set(true);
    const sub = this.blogService.getBlogBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          const blogData = res.data[0];
          this.blog.set(blogData);
          this.updateMetaTags(blogData);
          this.blogService.getAllBlogsCount({ id: blogData._id, user: this.userService.getUserId() }).subscribe();
        } else {
          this.seoService.clearSchema();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.seoService.clearSchema();
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  private fetchRecentBlogs() {
    this.blogService.getAllBlog({ pagination: { pageSize: 5, currentPage: 0 }, sort: { createdAt: -1 }, select: { name: 1, image: 1, createdAt: 1, slug: 1 } }, null).subscribe(res => {
      this.recentBlogs.set(res.data);
    });
  }

  private updateMetaTags(blog: Blog) {
    this.seoService.updateMetaData({
      title: blog.seoTitle || blog.name,
      description: blog.seoDescription || blog.shortDesc,
      keywords: blog.seoKeywords,
      image: blog.image,
      type: 'article',
      canonicalPath: `/blog/${blog.slug}`,
    });

    this.seoService.setBlogSchema(blog, [
      { label: this.translate.instant('ln.BlogTitle'), url: '/blogs' },
      { label: blog.name || blog.seoTitle || '', isCurrent: true },
    ]);
  }

  onShare() {
    this.dialog.open(SocialShareComponent, {
      data: this.blog(),
      width: '400px'
    });
  }

  onSubmitComment() {
    if (this.commentForm.invalid) return;
    if (!this.userService.getUserStatus()) {
      this.router.navigate(['/login']);
      return;
    }

    const data = {
      ...this.commentForm.value,
      blog: this.blog()?._id,
      reviewDate: new Date().toISOString()
    };

    this.commentService.addComment(data).subscribe({
      next: () => {
        this.uiService.success(this.translate.instant('ln.CommentSubmittedMsg'));
        this.commentForm.reset();
      },
      error: () => this.uiService.warn(this.translate.instant('ln.CommentFailedMsg'))
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
