import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {debounceTime, distinctUntilChanged, skip} from 'rxjs/operators';
import {NgModel} from '@angular/forms';
import {Subscription} from 'rxjs';

@Directive({
  selector: '[ngModelChangeDebounced]',
  standalone: true
})
export class NgModelChangeDebouncedDirective implements OnDestroy {
  @Output() ngModelChangeDebounced = new EventEmitter<any>();
  @Input() ngModelChangeDebounceTime = 500;

  private subscription: Subscription;

  constructor(private ngModel: NgModel) {
    this.subscription = this.ngModel.control.valueChanges.pipe(
      skip(1),
      distinctUntilChanged(),
      debounceTime(this.ngModelChangeDebounceTime)
    ).subscribe((value) => this.ngModelChangeDebounced.emit(value));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
