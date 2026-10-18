import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DATABASE_KEY } from '../../core/utils/global-variable';
import { UserService } from '../../services/common/user.service';
import { StorageService } from '../../services/core/storage.service';
import { UiService } from '../../services/core/ui.service';
import { SeoService } from '../../services/core/seo.service';



@Component({
  selector: 'app-complete-registration',
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class CompleteRegistrationComponent implements OnInit, OnDestroy {
  // Signals
  isLoading = signal<boolean>(false);
  sessionData = signal<any>(null);

  // Form
  regForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private userService = inject(UserService);
  private uiService = inject(UiService);
  private seoService = inject(SeoService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({ title: 'নিবন্ধন সম্পন্ন করুন', noIndex: true });
    const subRoute = this.route.queryParamMap.subscribe(params => {
      this.initForm();
      const holdData = this.storageService.getDataFromSessionStorage(DATABASE_KEY.signUpHoldData);
      if (holdData) {
        this.sessionData.set(holdData);
        this.regForm.patchValue(holdData);
      }
    });
    this.subscriptions.push(subRoute);
  }

  private initForm() {
    this.regForm = this.fb.group({
      name: ['', Validators.required],
      phoneNo: ['', [Validators.required, Validators.pattern(/^(\+?8801|01)[0-9]{9}$/)]],
      email: ['', [Validators.email]],
      addressLine: ['']
    });
  }

  onSubmit() {
    if (this.regForm.invalid) {
      this.uiService.warn('অনুগ্রহ করে সকল সঠিক তথ্য প্রদান করুন।');
      return;
    }

    this.isLoading.set(true);
    const finalData = { ...this.regForm.value, ...this.sessionData() };
    const navigateFrom = this.route.snapshot.queryParamMap.get('navigateFrom') || '/';

    this.userService.userSignupAndLoginSocial(finalData, navigateFrom);
    // Note: userService handles loading state and navigation internally usually, 
    // but if it fails we reset loading here.
    setTimeout(() => this.isLoading.set(false), 5000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
