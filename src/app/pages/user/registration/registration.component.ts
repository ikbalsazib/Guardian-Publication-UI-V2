import { Component, OnInit, inject, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OtpService } from '../../../services/common/otp.service';
import { UserService } from '../../../services/common/user.service';
import { UiService } from '../../../services/core/ui.service';
import { UtilsService } from '../../../services/core/utils.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../interfaces/common/user.interface';
import { StorageService } from '../../../services/core/storage.service';
import { DATABASE_KEY } from '../../../core/utils/global-variable';
import { SeoService } from '../../../services/core/seo.service';

declare var FB: any;

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ]
})
export class RegistrationComponent implements OnInit {
  // Google login
  @ViewChild('googleLoginRef', { static: true }) loginElement!: ElementRef;

  // Data Form
  dataForm!: FormGroup;
  isPasswordShow = false;
  isLoading = false;
  isOtpSent = false;
  countdown = 0;
  navigateFrom: string | null = null;
  auth2: any;

  // Dependencies
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private uiService = inject(UiService);
  private otpService = inject(OtpService);
  private utilsService = inject(UtilsService);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  private timerInstance: any;

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({
      title: this.translateService.instant('ln.RegistrationTitle') || 'Registration - Guardian Publications',
      noIndex: true
    });
    this.initDataForm();
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.navigateFrom = params.get('navigateFrom');
    });

    if (isPlatformBrowser(this.platformId)) {
      this.sdkManager();
    }
  }

  private initDataForm() {
    this.dataForm = this.fb.group({
      name: [null, Validators.required],
      username: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      otp: [null],
      isAccept: [false, Validators.requiredTrue]
    });
  }

  get name() { return this.dataForm.get('name'); }
  get username() { return this.dataForm.get('username'); }
  get password() { return this.dataForm.get('password'); }

  onShowPassword() {
    this.isPasswordShow = !this.isPasswordShow;
  }

  onSendOtp() {
    const username = this.dataForm.get('username')?.value;
    if (!username) {
      this.uiService.warn(this.translateService.instant('ln.ProvideUsernameEmailPhone') || 'Please enter your username (Email/Phone)');
      return;
    }

    this.isLoading = true;
    this.isOtpSent = true;
    this.startCountdown(60);

    const isEmail = this.utilsService.validateEmail(username);

    const obs = isEmail
      ? this.otpService.generateOtpWithEmail(username)
      : this.otpService.generateOtpWithPhoneNo(username);

    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.uiService.success(res.message || 'OTP sent');
        } else {
          this.isOtpSent = false;
          if (this.timerInstance) clearInterval(this.timerInstance);
          this.countdown = 0;
          this.uiService.warn(res.message || 'Error');
        }
        this.isLoading = false;
      },
      error: () => {
        this.isOtpSent = false;
        if (this.timerInstance) clearInterval(this.timerInstance);
        this.countdown = 0;
        this.isLoading = false;
      }
    });
  }

  private startCountdown(seconds: number) {
    this.countdown = seconds;
    if (this.timerInstance) clearInterval(this.timerInstance);
    this.timerInstance = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timerInstance);
      }
    }, 1000);
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.warn(this.translateService.instant('ln.ProvideValidInfo') || 'Please provide all valid information.');
      return;
    }

    if (!this.isOtpSent) {
      this.onSendOtp();
      return;
    }

    this.onSubmitData();
  }

  onSubmitData() {
    this.isLoading = true;
    const formData = this.dataForm.value;
    const isEmail = this.utilsService.validateEmail(formData.username);

    const validateObs = isEmail
      ? this.otpService.validateOtpWithEmail({ email: formData.username, code: formData.otp })
      : this.otpService.validateOtpWithPhoneNo({ phoneNo: formData.username, code: formData.otp });

    validateObs.subscribe({
      next: (res) => {
        if (res.success) {
          const user = {
            name: formData.name,
            username: formData.username,
            password: formData.password,
            registrationType: isEmail ? 'email' : 'phone',
            hasAccess: true
          };
          this.userService.userSignupAndLogin(user as any, this.navigateFrom || undefined);
        } else {
          this.uiService.warn(res.message || 'Validation failed');
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  private checkUserForRegistration(data: User) {
    this.userService.checkUserForRegistration(data.username!).subscribe({
      next: (res) => {
        if (res.data.hasUser) {
          this.userService.userSignupAndLoginSocial(data, this.navigateFrom || undefined);
        } else {
          this.storageService.storeDataToSessionStorage(DATABASE_KEY.signUpHoldData, data);
          this.router.navigate(['/complete-registration'], {
            queryParams: { navigateFrom: this.navigateFrom },
            queryParamsHandling: 'merge',
          });
        }
      },
      error: (err) => console.log(err),
    });
  }

  async sdkManager() {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
      this.initGoogleAuth();
    } else {
      window.addEventListener('load', () => {
        if (typeof (window as any).google !== 'undefined' && (window as any).google.accounts) {
          this.initGoogleAuth();
        }
      });
    }
  }

  private initGoogleAuth() {
    (window as any).google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response)
    });
    (window as any).google.accounts.id.renderButton(
      this.loginElement.nativeElement,
      { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with' }
    );
  }

  private handleGoogleCredentialResponse(response: any) {
    if (response.credential) {
      const user: any = {
        token: response.credential,
        registrationType: 'google',
        userFrom: 'Online',
        hasAccess: true
      };

      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        user.name = payload.name;
        user.username = payload.sub;
        user.email = payload.email;
        user.profileImg = payload.picture;
      } catch (e) {
        console.error('Failed to parse Google JWT locally', e);
      }

      this.checkUserForRegistration(user);
    }
  }
}
