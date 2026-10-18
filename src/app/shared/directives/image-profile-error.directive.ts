import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[checkImageProfile]',
  standalone: true
})
export class ImageProfileErrorDirective {
  @Input() src!: string;
  @HostBinding('src') get imageSrc() {
    return this.src ? this.src : this.defaultImg;
  }

  public defaultImg: string = '/images/avatar/user_low.png';

  @HostListener('error')
  public onError() {
    this.src = this.defaultImg;
  }
}
