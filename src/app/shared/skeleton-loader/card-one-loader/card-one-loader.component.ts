import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-card-one-loader',
  templateUrl: './card-one-loader.component.html',
  styleUrls: ['./card-one-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class CardOneLoaderComponent {

}
