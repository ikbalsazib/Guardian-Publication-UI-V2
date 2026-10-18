import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-youtube-loader',
  templateUrl: './youtube-loader.component.html',
  styleUrls: ['./youtube-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class YoutubeLoaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
