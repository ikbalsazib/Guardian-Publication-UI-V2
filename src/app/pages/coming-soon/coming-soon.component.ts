import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SeoService } from '../../services/core/seo.service';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule]
})
export class ComingSoonComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({ title: 'Coming Soon', noIndex: true });
  }
}
