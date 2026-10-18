import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfConverterService {

  constructor(private http: HttpClient) {
    // Set PDF.js worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.js';
  }

  async convertPdf(pdfUrl: string): Promise<string[]> {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdfDocument = await loadingTask.promise;
    const imageArray: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);

      // Increase scale for higher resolution
      const scale =4; // Adjust scale factor for highest quality
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Adjust canvas rendering quality
      context.imageSmoothingEnabled = true;

      const renderContext = {
        canvasContext: context as CanvasRenderingContext2D,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      imageArray.push(canvas.toDataURL());
    }

    return imageArray;
  }
}
