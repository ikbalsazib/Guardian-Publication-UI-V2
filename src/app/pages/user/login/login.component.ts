import { Component, ElementRef, OnInit, ViewChild, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/common/user.service';
import { StorageService } from '../../../services/core/storage.service';
import { UiService } from '../../../services/core/ui.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../interfaces/common/user.interface';
import { DATABASE_KEY } from '../../../core/utils/global-variable';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SeoService } from '../../../services/core/seo.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

declare var FB: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class LoginComponent implements OnInit {
  // Google and fb login
  @ViewChild('googleLoginRef', { static: true }) loginElement!: ElementRef;

  // Data Form
  dataForm!: FormGroup;
  isPasswordShow = false;
  isLoading = false;
  navigateFrom: string | null = null;
  auth2: any;

  // Dependencies
  private fb = inject(FormBuilder);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private uiService = inject(UiService);
  private storageService = inject(StorageService);
  private platformId = inject(PLATFORM_ID);
  private seoService = inject(SeoService);
  private translateService = inject(TranslateService);

  ngOnInit(): void {
    this.seoService.clearSchema();
    this.seoService.updateMetaData({
      title: this.translateService.instant('ln.LoginTitle') || 'Login - Guardian Publications',
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
      username: [null, [Validators.required]],
      password: new FormControl(
        { value: null, disabled: false },
        [
          Validators.minLength(6),
          Validators.required
        ]
      ),
    });
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.username?.markAsTouched({ onlySelf: true });
      this.password?.markAsTouched({ onlySelf: true });
      this.uiService.warn('Please fill all the required fields');
      return;
    }

    if (this.dataForm.value.password && this.dataForm.value.password.length < 6) {
      this.dataForm.controls['password'].setErrors({ 'incorrect': true });
      this.uiService.warn('Password must be at least 6 characters');
      return;
    }

    this.isLoading = true;
    this.userService.userLogin(this.dataForm.value, this.navigateFrom || undefined);

    // Reset loading after some time if navigation doesn't happen
    setTimeout(() => {
      this.isLoading = false;
    }, 10000);
  }

  onShowPassword() {
    this.isPasswordShow = !this.isPasswordShow;
  }

  get username() {
    return this.dataForm.get('username');
  }

  get password() {
    return this.dataForm.get('password');
  }

  private checkUserForRegistration(data: User) {
    this.userService.checkUserForRegistration(data.username!).subscribe({
      next: (res) => {
        if (res.data.hasUser) {
          this.userService.userSignupAndLoginSocial(data, this.navigateFrom || undefined);
        } else {
          this.storageService.storeDataToSessionStorage(
            DATABASE_KEY.signUpHoldData,
            data
          );
          this.router.navigate(['/complete-registration'], {
            queryParams: { navigateFrom: this.navigateFrom },
            queryParamsHandling: 'merge',
          });
        }
      },
      error: (err) => {
        console.log(err);
      },
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

    if (typeof FB !== 'undefined') {
      FB.init({
        appId: environment.facebookAppId,
        status: true,
        xfbml: true,
        version: 'v15.0',
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
