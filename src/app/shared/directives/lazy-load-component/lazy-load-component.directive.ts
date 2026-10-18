import {Directive, ElementRef, EventEmitter, Inject, OnInit, Output, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Directive({
  selector: '[lazyLoadComponent]',
  standalone: true
})
export class LazyLoadComponentDirective implements OnInit {
  @Output() lazyLoad: EventEmitter<any> = new EventEmitter();

  private isBrowser: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.lazyLoad.emit();
          observer.disconnect();
        }
      }, options);

      observer.observe(this.elementRef.nativeElement);
    }
  }
}
