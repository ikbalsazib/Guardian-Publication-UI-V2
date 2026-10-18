import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}
  public transform(value: any): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value)
  }
}
