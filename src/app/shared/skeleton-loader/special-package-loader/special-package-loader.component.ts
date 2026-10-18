import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-special-package-loader',
  templateUrl: './special-package-loader.component.html',
  styleUrls: ['./special-package-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule]
})
export class SpecialPackageLoaderComponent {

}
