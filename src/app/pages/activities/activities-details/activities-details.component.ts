import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ActivitiesService } from '../../../services/common/activities.service';
import { Activities } from '../../../interfaces/common/activities.interface';
import { UserService } from '../../../services/common/user.service';
import { UiService } from '../../../services/core/ui.service';
import { ActivitiesCommentService } from '../../../services/common/activities-comment.service';
import { ActivitiesReviewListComponent } from '../activities-review-list/activities-review-list.component';
import { SocialShareComponent } from '../../../shared/dialog-view/ui/social-share/social-share.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { SeoService } from '../../../services/core/seo.service';
import { stripHtml } from '../../../core/utils/html-content.util';
import { SeoInternalLinksComponent } from '../../../shared/components/seo-internal-links/seo-internal-links.component';

@Component({
  selector: 'app-activities-details',
  templateUrl: './activities-details.component.html',
  styleUrls: ['./activities-details.component.scss'],
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
    ActivitiesReviewListComponent,
    SeoInternalLinksComponent
  ]
})
export class ActivitiesDetailsComponent implements OnInit, OnDestroy {
  // Signals
  activity = signal<Activities | null>(null);
  recentActivities = signal<Activities[]>([]);
  isLoading = signal<boolean>(false);

  // Form
  commentForm!: FormGroup;

  // Dependencies
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly activitiesService = inject(ActivitiesService);
  private readonly activitiesCommentService = inject(ActivitiesCommentService);
  private readonly userService = inject(UserService);
  private readonly uiService = inject(UiService);
  private readonly dialog = inject(MatDialog);
  private readonly seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initForm();
    const subRoute = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchActivityDetails(slug);
      }
    });
    this.subscriptions.push(subRoute);
    this.fetchRecentActivities();
  }

  private initForm() {
    this.commentForm = this.fb.group({
      review: ['', Validators.required]
    });
  }

  private fetchActivityDetails(slug: string) {
    this.isLoading.set(true);
    const sub = this.activitiesService.getActivitiesBySlug(slug, 'true').subscribe({
      next: (res: any) => {
        if (res.success && res.data.length > 0) {
          const activityData = res.data[0];
          this.activity.set(activityData);
          this.updateMetaData(activityData);
          this.activitiesService.getAllActivitiessCount({ id: activityData._id, user: this.userService.getUserId() }).subscribe();
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

  private fetchRecentActivities() {
    this.activitiesService.getAllActivities({ pagination: { pageSize: 5, currentPage: 0 }, sort: { createdAt: -1 }, select: {  name: 1,
      slug: 1,
      shortDesc: 1,
      image: 1,
      authorName: 1,
      totalView: 1,
      createdAt: 1,} }, undefined).subscribe({
      next: (res: any) => {
        this.recentActivities.set(res.data);
      }
    });
  }

  private updateMetaData(activity: Activities) {
    const title = activity.name || '';
    const description = stripHtml(activity.shortDesc || activity.description || '')
      || `${title} - Guardian Publications কার্যক্রম ও সংবাদ।`;

    this.seoService.updateMetaData({
      title,
      description: description.slice(0, 160),
      image: activity.image,
      type: 'article',
      canonicalPath: `/activities/${activity.slug}`,
    });

    this.seoService.setActivitySchema(activity, [
      { label: 'কার্যক্রম', url: '/activities' },
      { label: title, isCurrent: true },
    ]);
  }

  onShare() {
    this.dialog.open(SocialShareComponent, {
      data: this.activity(),
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
      activities: this.activity()?._id,
      reviewDate: new Date().toISOString()
    };

    this.activitiesCommentService.addComment(data).subscribe({
      next: () => {
        this.uiService.success('আপনার প্রতিক্রিয়াটি জমা হয়েছে এবং অনুমোদনের অপেক্ষায় আছে।');
        this.commentForm.reset();
      },
      error: () => this.uiService.warn('দুঃখিত! প্রতিক্রিয়াটি জমা দেওয়া সম্ভব হয়নি।')
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
