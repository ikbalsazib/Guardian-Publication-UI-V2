import { Component, Input, OnDestroy, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-counter-one',
  templateUrl: './time-counter-one.component.html',
  styleUrls: ['./time-counter-one.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TimeCounterOneComponent implements OnInit, OnDestroy {

  @Input() set endDate(value: any) {
    this._endDate = value;
    this.setTimer();
  }
  get endDate() {
    return this._endDate;
  }
  private _endDate: any;

  days = signal<string>('00');
  hours = signal<string>('00');
  min = signal<string>('00');
  sec = signal<string>('00');

  private timerId: any;
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit() {
    this.setTimer();
    this.timerId = setInterval(() => {
      this.setTimer();
      this.cdr.detectChanges(); // Force check in case of zone issues
    }, 1000)
  }

  setTimer() {
    if (!this.endDate) return;
    
    const dest = new Date(this.endDate).getTime();
    const now = new Date().getTime();
    const diff = dest - now;

    if (diff <= 0) {
      this.days.set('00');
      this.hours.set('00');
      this.min.set('00');
      this.sec.set('00');
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    this.days.set(d < 10 ? '0' + d : d.toString());
    this.hours.set(h < 10 ? '0' + h : h.toString());
    this.min.set(m < 10 ? '0' + m : m.toString());
    this.sec.set(s < 10 ? '0' + s : s.toString());
  }
  
  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
