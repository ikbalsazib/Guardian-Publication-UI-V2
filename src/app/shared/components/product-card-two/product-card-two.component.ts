import { Component, input, inject, OnInit } from '@angular/core';
import { Product } from '../../../interfaces/common/product';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from '@angular/common';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-product-card-two',
  templateUrl: './product-card-two.component.html',
  styleUrls: ['./product-card-two.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    PricePipe
  ]
})
export class ProductCardTwoComponent implements OnInit {
  // Inputs
  data = input<Product>();

  // Normal Data
  language: string | null = null;

  // Dependencies
  public translateService = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(qPram => {
      this.language = qPram.get('language');
    });
  }
}
