import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DATABASE_KEY } from '../../core/utils/global-variable';
import { User, UserAuthResponse } from '../../interfaces/common/user.interface';
import { ReloadService } from '../core/reload.service';
import { StorageService } from '../core/storage.service';
import { UiService } from '../core/ui.service';
import { CartService } from './cart.service';

const API_URL_USER = environment.apiBaseLink + '/api/user/';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly uiService = inject(UiService);
  private readonly cartService = inject(CartService);
  private readonly storageService = inject(StorageService);
  private readonly reloadService = inject(ReloadService);

  private token: string | null = null;
  private isUser = false;
  private userId: string | null = null;
  public userStatusListener = new Subject<boolean>();
  
  // Hold The Count Time..
  private tokenTimer: any;

  constructor() {
    this.autoUserLoggedIn();
  }


  /**
   * MAIN METHODS
   * checkUserForRegistration()
   * userSignupAndLogin()
   * userLogin()
   * checkFollwedAuthor()
   * getAllFollwedAuthor()
   */

  checkUserForRegistration(username: string) {
    return this.httpClient.post<{ data: { hasUser: boolean }, message: string, success: boolean }>(API_URL_USER + 'check-user-for-registration', { username });
  }

  resetUserPassword(data: any) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_URL_USER + 'reset-user-password', data);
  }


  userSignupAndLogin(data: User, navigateFrom?: string) {
    return new Promise((resolve, reject) => {
      this.httpClient.post<UserAuthResponse>(API_URL_USER + 'signup-and-login-password', data).subscribe({
        next: async (res) => {
          if (res.success && res.token) {
            this.token = res.token;
            if (res.data) {
              this.userId = res.data._id;
            }
            this.isUser = true;
            this.userStatusListener.next(true);

            let expiredInDuration = Number(res.tokenExpiredIn);
            if (isNaN(expiredInDuration) || expiredInDuration <= 0) {
              expiredInDuration = 86400; // 24 hours
            }
            this.setSessionTimer(expiredInDuration);

            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiredInDuration * 1000);
            this.saveUserData(res.token, expirationDate, this.userId || '');
            
            this.uiService.success(res.message || 'Signup successful');
            
            if (navigateFrom) {
              this.router.navigate([navigateFrom]);
            } else {
              this.router.navigate([environment.userBaseUrl]);
            }
            resolve(res);
          } else {
            this.uiService.wrong(res.message || 'Signup failed');
            this.userStatusListener.next(false);
            resolve(res);
          }
        },
        error: (error) => {
          console.log(error);
          this.userStatusListener.next(false);
          reject(error);
        }
      });
    });
  }

  userSignupAndLoginSocial(data: User, navigateFrom?: string) {
    this.httpClient.post<UserAuthResponse>(API_URL_USER + 'social-signup-and-login', data).subscribe({
      next: async (res) => {
        if (res.success && res.token) {
          this.token = res.token;
          if (res.data) {
            this.userId = res.data._id;
          }
          this.isUser = true;
          this.userStatusListener.next(true);

          let expiredInDuration = Number(res.tokenExpiredIn);
          if (isNaN(expiredInDuration) || expiredInDuration <= 0) {
            expiredInDuration = 86400;
          }
          this.setSessionTimer(expiredInDuration);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiredInDuration * 1000);
          this.saveUserData(res.token, expirationDate, this.userId || '');

          await this.syncLocalCartItems();
          this.uiService.success(res.message || 'Login successful');
          
          if (navigateFrom) {
            this.router.navigate([navigateFrom]);
          } else {
            this.router.navigate([environment.userBaseUrl]);
          }
        } else {
          this.uiService.wrong(res.message || 'Social login failed');
          this.userStatusListener.next(false);
        }
      },
      error: (error) => {
        console.log(error);
        this.userStatusListener.next(false);
      }
    });
  }


  userLoginOnlyPhone(data: { username: string, registrationType: string, phoneNo: string }, redirectTo?: string) {
    this.httpClient.post<UserAuthResponse>(API_URL_USER + 'social-signup-and-login', data).subscribe({
      next: async (res) => {
        if (res.success && res.token) {
          this.token = res.token;
          if (res.data) {
            this.userId = res.data._id;
          }
          this.isUser = true;
          this.userStatusListener.next(true);

          let expiredInDuration = Number(res.tokenExpiredIn);
          if (isNaN(expiredInDuration) || expiredInDuration <= 0) {
            expiredInDuration = 86400;
          }
          this.setSessionTimer(expiredInDuration);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiredInDuration * 1000);
          this.saveUserData(res.token, expirationDate, this.userId || '');

          await this.syncLocalCartItems();
          this.uiService.success(res.message || 'Login successful');

          if (redirectTo) {
            this.router.navigate(['/' + redirectTo]);
          } else {
            this.router.navigate([environment.userBaseUrl]);
          }
        } else {
          this.uiService.wrong(res.message || 'Login failed');
          this.userStatusListener.next(false);
        }
      },
      error: (error) => {
        console.error(error);
        this.userStatusListener.next(false);
      }
    });
  }

  checkFollwedAuthor(id: string) {
    const data = { author: id };
    return this.httpClient.post<{ success: boolean, data: boolean, message: string }>(API_URL_USER + 'check-followed-author', data);
  }

  getAllFollwedAuthor() {
    return this.httpClient.get<{ success: boolean, message: string, data: any[] }>(API_URL_USER + 'get-followed-author-list');
  }

  followUnfollowAuthorByUser(data: { type: string, author: string }) {
    return this.httpClient.post<{ success: boolean, message: boolean, data: any }>(API_URL_USER + 'author-follow-unfollow', data);
  }

  /**
   * USER AFTER LOGGED IN METHODS
   * autoUserLoggedIn()
   * userLogOut()
   */
  autoUserLoggedIn() {
    const authInformation = this.getUserData();
    if (!authInformation) {
      this.storageService.removeDataFromEncryptLocal(DATABASE_KEY.encryptUserLogin);
      return;
    }
    const now = new Date();
    const expDate = new Date(authInformation.expiredDate);
    const expiresIn = expDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userStatusListener.next(true);
      this.isUser = true;
      this.userId = authInformation.userId;
      this.setSessionTimer(expiresIn / 1000);
    }
  }

  userLogOut() {
    this.token = null;
    this.isUser = false;
    this.userStatusListener.next(false);
    this.reloadService.needRefreshCart$(false);
    this.clearUserData();
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.router.navigate([environment.userLoginUrl]);
  }

  /**
   * GET LOGGED IN BASE DATA
   */
  getUserStatus(): boolean {
    return this.isUser;
  }

  getUserToken(): string | null {
    return this.token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getUserStatusListener(): Observable<boolean> {
    return this.userStatusListener.asObservable();
  }


  userLogin(data: { username: string, password: string }, navigateFrom?: string) {
    return new Promise((resolve, reject) => {
      this.httpClient.post<UserAuthResponse>(API_URL_USER + 'login', data).subscribe({
        next: async (res) => {
          if (res.success && res.token) {
            this.token = res.token;
            if (res.data) {
              this.userId = res.data._id;
            }
            this.isUser = true;
            this.userStatusListener.next(true);

            let expiredInDuration = Number(res.tokenExpiredIn);
            if (isNaN(expiredInDuration) || expiredInDuration <= 0) {
              expiredInDuration = 86400;
            }
            this.setSessionTimer(expiredInDuration);

            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiredInDuration * 1000);
            this.saveUserData(res.token, expirationDate, this.userId || '');

            await this.syncLocalCartItems();
            this.uiService.success(res.message || 'Login successful');
            
            if (navigateFrom) {
              this.router.navigate([navigateFrom]);
            } else {
              this.router.navigate([environment.userBaseUrl]);
            }
            resolve(res);
          } else {
            this.uiService.wrong(res.message || 'Login failed');
            this.userStatusListener.next(false);
            if (res.success === false) {
              resolve(res);
            }
          }
        },
        error: (error) => {
          console.log(error);
          this.userStatusListener.next(false);
          reject(error);
        }
      });
    });
  }

  protected saveUserData(token: string, expiredDate: Date, userId: string) {
    const data = { token, expiredDate, userId };
    this.storageService.addDataToEncryptLocal(data, DATABASE_KEY.encryptUserLogin);
  }

  protected clearUserData() {
    this.storageService.removeDataFromEncryptLocal(DATABASE_KEY.encryptUserLogin);
  }

  protected getUserData() {
    return this.storageService.getDataFromEncryptLocal(DATABASE_KEY.encryptUserLogin);
  }

  private setSessionTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.userLogOut();
    }, Math.floor(duration) * 1000);
  }

  /**
   * CART UPDATE LOCAL TO MAIN DATABASE
   */
  private async syncLocalCartItems(): Promise<any> {
    if (typeof localStorage === 'undefined') return;
    const items = this.cartService.getCartItemFromLocalStorage();
    if (items && items.length) {
      return new Promise((resolve, reject) => {
        this.cartService.addToCartMultiple(items).subscribe({
          next: (res) => {
            this.cartService.deleteAllCartFromLocal(true);
            resolve(res);
          },
          error: (error) => reject(error)
        });
      });
    }
  }
}
