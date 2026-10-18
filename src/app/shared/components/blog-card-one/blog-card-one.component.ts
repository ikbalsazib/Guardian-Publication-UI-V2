import { Component, input, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { Blog } from "../../../interfaces/common/blog.interface";

@Component({
  selector: 'app-blog-card-one',
  templateUrl: './blog-card-one.component.html',
  styleUrls: ['./blog-card-one.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class BlogCardOneComponent implements OnInit {
  // Input as signal
  data = input.required<Blog>();

  // State
  language = signal<string | null>(null);

  // Platform
  private readonly platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  // Dependencies
  public readonly translateService = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    if (this.isBrowser) {
      this.activatedRoute.queryParamMap.subscribe(qPram => {
        this.language.set(qPram.get('language'));
      });
    }
  }
}
