import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReloadService {
  private readonly refreshData = new Subject<void>();
  private readonly refreshWishList = new BehaviorSubject<boolean>(false);
  private readonly refreshPcBuild = new Subject<void>();
  private readonly refreshCompareList = new Subject<void>();
  private readonly refreshCart = new BehaviorSubject<boolean>(false);
  private readonly refreshSearch = new BehaviorSubject<boolean>(false);
  private readonly refreshCategorySlide = new BehaviorSubject<boolean>(false);
  private readonly headerShopData = new Subject<any>();
  private readonly refreshSelectedData = new Subject<any>();
  private readonly refreshLang = new BehaviorSubject<string | null>(null);
  private readonly selectedAddress = new Subject<any>();
  private readonly refreshAccountSidebar = new BehaviorSubject<boolean | null>(null);

  get refreshLang$() {
    return this.refreshLang.asObservable();
  }

  needRefreshLang$(lang: string | null) {
    this.refreshLang.next(lang);
  }

  /**
   * REFRESH COMPARE DATA
   */
  get refreshCompareList$() {
    return this.refreshCompareList.asObservable();
  }

  needRefreshCompareList$() {
    this.refreshCompareList.next();
  }

  /**
   * REFRESH Select DATA
   */
  get refreshSelectData$() {
    return this.refreshSelectedData.asObservable();
  }

  needRefreshSelectData$(data: any) {
    this.refreshSelectedData.next(data);
  }


  /**
   * SELECT ADDRESS Data
   */
  get geSelectedAddressData() {
    return this.selectedAddress.asObservable();
  }

  passingSelectedAddressData(data: any) {
    this.selectedAddress.next(data);
  }

  /**
   * REFRESH PCBUILD DATA
   */
  get refreshPcBuild$() {
    return this.refreshPcBuild.asObservable();
  }

  needRefreshPcBuild$() {
    this.refreshPcBuild.next();
  }

  /**
   * REFRESH GLOBAL DATA
   */
  get refreshData$() {
    return this.refreshData.asObservable();
  }

  needRefreshData$() {
    this.refreshData.next();
  }

  /**
   * REFRESH GLOBAL DATA
   */
  get refreshWishList$() {
    return this.refreshWishList.asObservable();
  }

  needRefreshWishList$(data?: boolean) {
    this.refreshWishList.next(!!data);
  }


  /**
   * CART
   */
  get refreshCart$() {
    return this.refreshCart.asObservable();
  }

  needRefreshCart$(data?: boolean) {
    this.refreshCart.next(!!data);
  }

  /**
  * Search
  */
  get refreshSearch$() {
    return this.refreshSearch.asObservable();
  }

  needRefreshSearch$(data?: boolean) {
    this.refreshSearch.next(!!data);
  }

  /**
   Category Slide Refresh
  */
  get refreshCategorySlide$() {
    return this.refreshCategorySlide.asObservable();
  }

  needRefreshCategorySlide(data: boolean) {
    this.refreshCategorySlide.next(data);
  }

  /**
   * Pass Header Data
  */
  get getHeaderData() {
    return this.headerShopData.asObservable();
  }

  passHeaderData(data: any) {
    this.headerShopData.next(data);
  }

  /**
 *  REFRESH ACCOUNT SIDE BAR
 */
  get refreshAccountSideBar$() {
    return this.refreshAccountSidebar.asObservable();
  }

  needRefreshAccountSideBar$(data: boolean | null) {
    this.refreshAccountSidebar.next(data);
  }
}
