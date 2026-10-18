import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appOutSideClick]',
  standalone: true
})
export class OutSideClickDirective {

  @Output() outsideClick: EventEmitter<MouseEvent> = new EventEmitter();
  @Output() insideClick: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.outsideClick.emit(event);
    } else  {
      this.insideClick.emit(event);
    }
  }
}
