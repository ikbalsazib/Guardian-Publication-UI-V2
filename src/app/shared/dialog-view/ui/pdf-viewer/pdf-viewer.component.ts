import {
  Component,
  Inject,
  AfterViewInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import * as pdfjsLib from 'pdfjs-dist';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule]
})
export class PdfViewerComponent implements AfterViewInit {
  isLoading = true;
  showNoPdfMessage = false;

  public dialogRef = inject(MatDialogRef<PdfViewerComponent>);
  private platformId = inject(PLATFORM_ID);
  public data = inject(MAT_DIALOG_DATA);

  private pdfContainer: any = null;
  private pdf: any;
  private scale: number | null = null;
  private numPages = 0;
  private renderedPages = new Set<number>();
  private observer!: IntersectionObserver;

  constructor() {
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.pdfContainer = document.getElementById('pdfContainer');
        if (this.data?.pdfFile) {
          this.loadPdf(this.data.pdfFile);
        } else {
          this.showNoPdfMessage = true;
          this.isLoading = false;
        }
      });
    }
  }

  async loadPdf(url: string) {
    try {
      this.isLoading = true;
      if (this.pdfContainer) this.pdfContainer.innerHTML = '';

      this.pdf = await pdfjsLib.getDocument(url).promise;
      this.numPages = this.pdf.numPages;

      this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
        root: this.pdfContainer ? this.pdfContainer.parentElement : null,
        threshold: 0.1
      });

      for (let i = 1; i <= this.numPages; i++) {
        const placeholder = document.createElement('div');
        placeholder.id = `page-${i}`;
        placeholder.style.minHeight = '200px';
        placeholder.style.width = '100%';
        placeholder.style.display = 'flex';
        placeholder.style.justifyContent = 'center';
        placeholder.dataset['pageNumber'] = i.toString();
        if (this.pdfContainer) this.pdfContainer.appendChild(placeholder);
        this.observer.observe(placeholder);
      }
    } catch (err) {
      console.error('PDF load error:', err);
      this.showNoPdfMessage = true;
    } finally {
      this.isLoading = false;
    }
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const pageNum = Number((entry.target as HTMLElement).dataset['pageNumber']);
        if (!this.renderedPages.has(pageNum)) {
          this.renderPage(pageNum, entry.target);
        }
      }
    }
  }

  async renderPage(pageNum: number, placeholder: Element) {
    try {
      const page = await this.pdf.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });

      if (!this.scale) {
        const containerWidth = this.pdfContainer ? this.pdfContainer.clientWidth : 700;
        this.scale = (containerWidth / unscaledViewport.width) * 0.95;
      }

      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: this.scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      canvas.width = viewport.width * outputScale;
      canvas.height = viewport.height * outputScale;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      await page.render({ canvasContext: context, viewport }).promise;

      // Replace placeholder with canvas securely
      placeholder.innerHTML = '';
      placeholder.appendChild(canvas);
      this.renderedPages.add(pageNum);
    } catch (e) {
      console.error(`Error rendering page ${pageNum}:`, e);
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
