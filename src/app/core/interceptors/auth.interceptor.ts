import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../../services/core/storage.service';
import { DATABASE_KEY } from '../utils/global-variable';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authData = storageService.getDataFromEncryptLocal(DATABASE_KEY.encryptUserLogin);
  const token = authData?.token;

  if (token) {
    req = req.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }
  
  return next(req);
};
