import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Blog } from "../../../interfaces/common/blog.interface";
import { EngBnNumPipe } from '../../pipes/eng-bn-num.pipe';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-activities-card-one',
  templateUrl: './activities-card-one.component.html',
  styleUrls: ['./activities-card-one.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    EngBnNumPipe,
    SafeHtmlPipe
  ]
})
export class ActivitiesCardOneComponent implements OnInit {
  @Input() data?: Blog;

  // State
  language = signal<string | null>(null);

  // Dependencies
  public readonly translateService = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(qPram => {
      this.language.set(qPram.get('language'));
    });
  }
}
