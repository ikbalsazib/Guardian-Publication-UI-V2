import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[checkImageDefault]',
  standalone: true
})
export class ImageLoadErrorDirective {
  @Input() src!: string;
  @HostBinding('src') get imageSrc() {
    return this.src ? this.src : this.defaultImg;
  }

  public defaultImg: string = '/images/placeholder/test.png';

  @HostListener('error')
  public onError() {
    this.src = this.defaultImg;
  }
}
