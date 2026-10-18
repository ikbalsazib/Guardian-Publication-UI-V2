import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { SecretKeyTypeEnum } from '../../enum/secret-key-type.enum';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * SESSION STORAGE
   */
  storeDataToSessionStorage(key: string, data: any) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  }

  getDataFromSessionStorage(key: string): any {
    if (typeof sessionStorage !== 'undefined') {
      const data = sessionStorage.getItem(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  removeSessionData(key: string) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  /**
   * LOCAL STORAGE
   */
  storeDataToLocalStorage(data: any, key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  getDataFromLocalStorage(key: string): any {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }

  removeLocalData(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  /**
   * ENCRYPT STORAGE
   */
  addDataToEncryptLocal(data: object, key: string) {
    if (typeof localStorage !== 'undefined') {
      const encryptedData = this.encryptWithCrypto(data, SecretKeyTypeEnum.STORAGE_TOKEN);
      localStorage.setItem(key, encryptedData);
    }
  }

  getDataFromEncryptLocal(key: string): any {
    if (typeof localStorage !== 'undefined') {
      const encryptString = localStorage.getItem(key);
      if (encryptString) {
        return this.decryptWithCrypto(encryptString, SecretKeyTypeEnum.STORAGE_TOKEN);
      }
    }
    return null;
  }

  removeDataFromEncryptLocal(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }

  /**
   * ENCRYPT CRYPTO JS
   */
  encryptWithCrypto(data: object, secretKey: string): string {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    return CryptoJS.AES.encrypt(JSON.stringify(data), cryptToSecretKey).toString();
  }

  encryptStringWithCrypto(str: string, secretKey: string): string {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    return CryptoJS.AES.encrypt(str, cryptToSecretKey).toString();
  }

  decryptWithCrypto(encryptString: string, secretKey: string): any {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    const bytes = CryptoJS.AES.decrypt(encryptString, cryptToSecretKey);
    try {
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return null;
    }
  }

  decryptStringWithCrypto(encryptString: string, secretKey: string): string | null {
    const cryptToSecretKey = this.getSecretKey(secretKey);
    const bytes = CryptoJS.AES.decrypt(encryptString, cryptToSecretKey);
    try {
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return null;
    }
  }

  // Get Secret Key
  protected getSecretKey(secretKey: string): string {
    switch (secretKey) {
      case SecretKeyTypeEnum.USER_TOKEN:
        return environment.userTokenSecret;
      case SecretKeyTypeEnum.API_TOKEN:
        return environment.apiTokenSecret;
      case SecretKeyTypeEnum.STORAGE_TOKEN:
        return environment.storageSecret;
      default:
        return environment.storageSecret;
    }
  }
}
