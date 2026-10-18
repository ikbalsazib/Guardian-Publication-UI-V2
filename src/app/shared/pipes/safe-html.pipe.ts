import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { normalizeCmsHtml } from '../../core/utils/html-content.util';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}
  
  public transform(value: any): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(normalizeCmsHtml(String(value)));
  }
}
