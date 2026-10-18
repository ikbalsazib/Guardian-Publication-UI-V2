import { Component, OnInit, inject } from '@angular/core';
import { NgxLoaderService } from '../../../services/core/ngx-loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnInit {
  public ngxLoader = inject(NgxLoaderService);

  ngOnInit(): void {}
}
