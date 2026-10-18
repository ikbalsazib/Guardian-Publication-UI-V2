import { CommonModule } from '@angular/common';
import { Component, input, inject, OnInit, signal } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Category } from '../../../interfaces/common/category.interface';

@Component({
  selector: 'app-category-card-one',
  templateUrl: './category-card-one.component.html',
  styleUrls: ['./category-card-one.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule]
})
export class CategoryCardOneComponent implements OnInit {
  // Inputs as signals
  data = input<Category>();

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
