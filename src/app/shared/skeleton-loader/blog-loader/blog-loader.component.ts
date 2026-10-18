import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-blog-loader',
  templateUrl: './blog-loader.component.html',
  styleUrls: ['./blog-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class BlogLoaderComponent {

}
