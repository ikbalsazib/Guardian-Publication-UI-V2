import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-small-banner-loader',
  templateUrl: './small-banner-loader.component.html',
  styleUrls: ['./small-banner-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class SmallBannerLoaderComponent {

}
