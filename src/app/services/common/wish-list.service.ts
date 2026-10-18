import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { DATABASE_KEY } from '../../core/utils/global-variable';
import { ReloadService } from '../core/reload.service';
import { WishList } from '../../interfaces/common/wish-list.interface';
import { UiService } from '../core/ui.service';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';
import { environment } from '../../../environments/environment';

const API_CART = environment.apiBaseLink + '/api/wishList/';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private readonly httpClient = inject(HttpClient);
  private readonly reloadService = inject(ReloadService);
  private readonly uiService = inject(UiService);

  /**
   * REFRESH LOCAL STORED CART
   */
  private readonly refreshStoredWishList = new Subject<void>();

  get refreshStoredWishList$() {
    return this.refreshStoredWishList.asObservable();
  }

  needRefreshStoredWishList$() {
    this.refreshStoredWishList.next();
  }


  // Store Data
  private wishList: WishList[] = [];

  constructor() { }


  /**
  * addToWishList
  * getWishListByUserId
  * deleteWishListById
  * updateWishListById
  * updateWishListQty
  */

  addToWishList(data: WishList) {
    return this.httpClient.post<ResponsePayload>(API_CART + 'add-to-wish-list', data);
  }

  addToWishListMultiple(data: WishList[]) {
    return this.httpClient.post<ResponsePayload>(API_CART + 'add-to-wish-list-multiple', data);
  }

  getWishListByUser() {
    return this.httpClient.get<{ data: WishList[], count: number, success: boolean }>(API_CART + 'get-wish-lists-by-user');
  }

  deleteWishListById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_CART + 'delete/' + id, { params });
  }

  updateWishListById(id: string, data: WishList) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_CART + 'update/' + id, data);
  }

  updateWishListQty(id: string, data: { selectedQty: number, type: string }) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_CART + 'update-qty/' + id, data);
  }

  /**
   * CART LOCAL STORAGE
   * addWishListItemToLocalStorage()
   * getWishListItemFromLocalStorage()
   * deleteWishListItemFromLocalStorage()
   * deleteAllWishListFromLocal()
   */
  addWishListItemToLocalStorage(wishListItem: WishList) {
    if (typeof localStorage === 'undefined') return;
    
    const data = localStorage.getItem(DATABASE_KEY.userWishList);
    let wishLists: WishList[] = [];

    if (data) {
      try {
        wishLists = JSON.parse(data);
      } catch (e) {
        wishLists = [];
      }
    }

    const fIndex = wishLists.findIndex((o: any) => o.product === wishListItem.product);
    if (fIndex === -1) {
      wishLists.push(wishListItem);
    } else {
      wishLists[fIndex].selectedQty = (wishLists[fIndex].selectedQty ?? 0) + 1;
    }
    
    localStorage.setItem(DATABASE_KEY.userWishList, JSON.stringify(wishLists));
  }

  getWishListItemFromLocalStorage(): WishList[] {
    if (typeof localStorage === 'undefined') return [];
    
    const wishLists = localStorage.getItem(DATABASE_KEY.userWishList);
    if (!wishLists) {
      return [];
    }
    try {
      return JSON.parse(wishLists) as WishList[];
    } catch (e) {
      return [];
    }
  }

  deleteWishListItemFromLocalStorage(id: string) {
    if (typeof localStorage === 'undefined') return;
    
    const data = localStorage.getItem(DATABASE_KEY.userWishList);
    if (data) {
      try {
        const items: WishList[] = JSON.parse(data);
        const filtered = items.filter((el: any) => el.product !== id);
        localStorage.setItem(DATABASE_KEY.userWishList, JSON.stringify(filtered));
      } catch (e) {
        // Handle error
      }
    }
  }

  deleteAllWishListFromLocal(refresh?: boolean) {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(DATABASE_KEY.userWishList);
    this.reloadService.needRefreshCart$(!!refresh);
  }

  /**
   * CART STORE & GET LOCALLY
   * updateWishListList()
   * wishListItems()
   */
  public updateWishList(data: WishList[]) {
    this.wishList = data;
    this.needRefreshStoredWishList$();
  }

  public get wishListItems() {
    return [...this.wishList]
  }
}
