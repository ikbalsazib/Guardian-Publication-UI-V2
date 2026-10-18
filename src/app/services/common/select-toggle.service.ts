import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SelectToggleService {
  selectToggle = new BehaviorSubject<string>('');
  selectCountryToggle = new BehaviorSubject<string>('');
  selectOptionToggle = new BehaviorSubject<string>('');
  constructor() {}
}
