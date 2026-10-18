import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Category } from '../../../interfaces/common/category.interface';

@Component({
  selector: 'app-category-card-two',
  templateUrl: './category-card-two.component.html',
  styleUrls: ['./category-card-two.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class CategoryCardTwoComponent implements OnInit {
  @Input() data?: Category;

  // States
  language = signal<string | null>(null);

  // Dependencies
  public translateService = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(qPram => {
      this.language.set(qPram.get('language'));
    });
  }
}
