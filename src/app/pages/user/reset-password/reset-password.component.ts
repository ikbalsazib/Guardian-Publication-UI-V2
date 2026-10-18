import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OtpService } from '../../../services/common/otp.service';
import { UserService } from '../../../services/common/user.service';
import { UiService } from '../../../services/core/ui.service';
import { UtilsService } from '../../../services/core/utils.service';
import { SeoService } from '../../../services/core/seo.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  // Signals
  isLoading = signal<boolean>(false);
  isOtpSent = signal<boolean>(false);
  isPasswordVisible = signal<boolean>(false);
  countdown = signal<number>(0);

  // Form
  resetForm!: FormGroup;

  // Dependencies
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private otpService = inject(OtpService);
  private uiService = inject(UiService);
  private utilsService = inject(UtilsService);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  private timerInstance: any;

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({
      title: this.translateService.instant('ln.PasswordRecoveryTitle') || 'Password Recovery',
      noIndex: true,
    });
    this.initForm();
  }

  private initForm() {
    this.resetForm = this.fb.group({
      username: ['', [Validators.required]],
      otp: [''],
      password: ['']
    });
  }

  onSendOtp() {
    const username = this.resetForm.get('username')?.value;
    if (!username) {
      this.uiService.warn(this.translateService.instant('ln.ProvideUsernameEmailPhone') || 'Please enter your username (Email/Phone)');
      return;
    }

    this.isLoading.set(true);
    this.userService.checkUserForRegistration(username).subscribe({
      next: (res) => {
        if (res.data.hasUser) {
          this.isOtpSent.set(true);
          this.startCountdown(60);

          const isEmail = this.utilsService.validateEmail(username);
          const otpObs = isEmail
            ? this.otpService.generateOtpWithEmail(username)
            : this.otpService.generateOtpWithPhoneNo(username);

          otpObs.subscribe({
            next: (otpRes) => {
              if (otpRes.success) {
                this.uiService.success(otpRes.message || 'OTP sent successfully');
              } else {
                this.isOtpSent.set(false);
                if (this.timerInstance) clearInterval(this.timerInstance);
                this.countdown.set(0);
                this.uiService.warn(otpRes.message || 'Failed to send OTP');
              }
              this.isLoading.set(false);
            },
            error: () => {
              this.isOtpSent.set(false);
              if (this.timerInstance) clearInterval(this.timerInstance);
              this.countdown.set(0);
              this.isLoading.set(false);
            }
          });
        } else {
          this.uiService.warn(this.translateService.instant('ln.NoAccountFound') || 'No account found for this username.');
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  private startCountdown(seconds: number) {
    this.countdown.set(seconds);
    if (this.timerInstance) clearInterval(this.timerInstance);
    this.timerInstance = setInterval(() => {
      this.countdown.update(v => v > 0 ? v - 1 : 0);
      if (this.countdown() === 0) clearInterval(this.timerInstance);
    }, 1000);
  }

  onSubmit() {
    if (!this.isOtpSent()) {
      this.onSendOtp();
      return;
    }

    const formData = this.resetForm.value;

    if (!formData.otp) {
      this.uiService.warn(this.translateService.instant('ln.ProvideOtpCode') || 'Please enter the OTP code.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      this.uiService.warn(this.translateService.instant('ln.PasswordMustBe6Chars') || 'New password must be at least 6 characters.');
      return;
    }

    this.isLoading.set(true);
    const isEmail = this.utilsService.validateEmail(formData.username);

    const validateObs = isEmail
      ? this.otpService.validateOtpWithEmail({ email: formData.username, code: formData.otp })
      : this.otpService.validateOtpWithPhoneNo({ phoneNo: formData.username, code: formData.otp });

    validateObs.subscribe({
      next: (res) => {
        if (res.success) {
          const resetData = { username: formData.username, password: formData.password };
          this.userService.resetUserPassword(resetData as any).subscribe(resetRes => {
            if (resetRes.success) {
              this.uiService.success(this.translateService.instant('ln.PasswordChangedSuccessfully') || 'Password changed successfully. Please login.');
              this.router.navigate(['/login']);
            } else {
              this.uiService.wrong(this.translateService.instant('ln.FailedToChangePassword') || 'Failed to change password.');
            }
            this.isLoading.set(false);
          });
        } else {
          this.uiService.warn(res.message || 'Validation failed');
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }
}
