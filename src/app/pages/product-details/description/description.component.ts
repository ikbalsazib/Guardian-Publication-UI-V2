import { Component, input, OnInit, OnDestroy, inject, signal, effect, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthorService } from '../../../services/common/author.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../../services/common/user.service';
import { ReloadService } from '../../../services/core/reload.service';
import { UiService } from '../../../services/core/ui.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RatingAndReviewComponent } from '../rating-and-review/rating-and-review.component';
import { PosterCardOneComponent } from '../../../shared/components/poster-card-one/poster-card-one.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { Author } from '../../../interfaces/common/author.interface';
import { Product } from '../../../interfaces/common/product';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    RatingAndReviewComponent,
    SafeHtmlPipe
  ]
})
export class DescriptionComponent implements OnInit, OnDestroy, OnChanges {
  // Inputs
  product = input.required<Product>();
  data = input<any>();

  // Signals
  author = signal<Author | null>(null);
  tabNo = signal<number>(0);
  isFollowAuthor = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Dependencies
  private authorService = inject(AuthorService);
  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private reloadService = inject(ReloadService);
  private uiService = inject(UiService);
  public translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const subRoute = this.activatedRoute.queryParamMap.subscribe(res => {
      const authorId = res.get('authorId');
      if (authorId) {
        this.fetchAuthorData(authorId);
      }
    });
    this.subscriptions.push(subRoute);

    // Initial author data from input
    if (this.product()?.author?.length) {
      this.fetchAuthorData(this.product().author[0]._id!);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product()?.author?.length) {
      this.fetchAuthorData(this.product().author[0]._id!);
    }
  }

  private fetchAuthorData(id: string) {
    this.isLoading.set(true);
    const subA = this.authorService.getAuthorById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.author.set(res.data);
          this.checkFollowedAuthor(id);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.isLoading.set(false);
      }
    });
    this.subscriptions.push(subA);
  }

  private checkFollowedAuthor(id: string) {
    if (this.userService.getUserStatus()) {
      const subCheck = this.userService.checkFollwedAuthor(id).subscribe({
        next: (res) => {
          if (res.success) this.isFollowAuthor.set(res.data);
        }
      });
      this.subscriptions.push(subCheck);
    }
  }

  followUnfollowAuthor(type: string) {
    const authorId = this.author()?._id;
    if (!authorId) return;

    if (!this.userService.getUserStatus()) {
      this.uiService.warn('Please login first');
      return;
    }

    const subF = this.userService.followUnfollowAuthorByUser({ type, author: authorId }).subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.success(res.message);
          this.isFollowAuthor.set(type === 'follow');
          this.reloadService.needRefreshData$();
        }
      },
      error: (err) => console.log(err)
    });
    this.subscriptions.push(subF);
  }

  setTab(step: number) {
    this.tabNo.set(step);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
