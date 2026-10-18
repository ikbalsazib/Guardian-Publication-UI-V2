import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  isCurrent?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="Breadcrumb">
      <div class="container">
        <ul class="breadcrumb-list">
          <li class="breadcrumb-item">
            <a routerLink="/"><i class="fa fa-home"></i> {{ 'ln.Home1' | translate }}</a>
          </li>
          <li *ngFor="let item of items()" class="breadcrumb-item" [class.active]="item.isCurrent">
            <span class="separator"><i class="fa fa-angle-right"></i></span>
            <a *ngIf="item.url && !item.isCurrent" [routerLink]="item.url">{{ item.label }}</a>
            <span *ngIf="!item.url || item.isCurrent">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: 15px 0;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
    }
    .breadcrumb-list {
      display: flex;
      flex-wrap: wrap;
      list-style: none;
      padding: 0;
      margin: 0;
      align-items: center;
      gap: 10px;
    }
    .breadcrumb-item {
      font-size: 14px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 10px;
      
      a {
        text-decoration: none;
        color: #C92127;
        font-weight: 500;
        &:hover {
          text-decoration: underline;
        }
      }
      
      &.active {
        color: #333;
        font-weight: 600;
      }
    }
    .separator {
      color: #ccc;
      font-size: 12px;
    }
  `]
})
export class BreadcrumbComponent {
  items = input.required<BreadcrumbItem[]>();
}
