import { Injectable } from '@angular/core';
import { Cart } from '../../interfaces/common/cart.interface';
import { DATABASE_KEY } from '../../core/utils/global-variable';
import { ReloadService } from '../core/reload.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResponsePayload } from 'src/app/interfaces/core/response-payload.interface';
import {Product} from "../../interfaces/common/product";
import {ProductService} from "./product.service";
import {SpecialPackagesService} from "./special-packages.service";

const API_CART = environment.apiBaseLink + '/api/cart/';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  /**
 * REFRESH LOCAL STORED CART
 */
  private refreshStoredCart = new Subject<void>();

  get refreshStoredCart$() {
    return this.refreshStoredCart;
  }

  needRefreshStoredCart$() {
    this.refreshStoredCart.next();
  }

  // Store Data
  private cartList: Cart[] = [];

  constructor(
    private httpClient: HttpClient,
    private reloadService: ReloadService,
    private productService: ProductService,
    private comboPackageService: SpecialPackagesService,
  ) {
  }

  /**
   * addToCart
   * getCartByUserId
   * deleteCartById
   * updateCartById
   * updateCartQty
   */

  addToCart(data: Cart) {
    return this.httpClient.post<ResponsePayload>
      (API_CART + 'add-to-cart', data);
  }

  addToCartMultiple(data: Cart[]) {
    return this.httpClient.post<ResponsePayload>
      (API_CART + 'add-to-cart-multiple', data);
  }

  getCartByUser() {
    return this.httpClient.get<{ data: Cart[], count: number, success: boolean }>(API_CART + 'get-carts-by-user');
  }

  deleteCartById(id: string, checkUsage?: boolean) {
    let params = new HttpParams();
    if (checkUsage) {
      params = params.append('checkUsage', checkUsage);
    }
    return this.httpClient.delete<ResponsePayload>(API_CART + 'delete/' + id, { params });
  }

  updateCartById(id: string, data: Cart) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_CART + 'update/' + id, data);
  }

  updateCartQty(id: string, data: { selectedQty: number, type: string }) {
    return this.httpClient.put<{ message: string, success: boolean }>(API_CART + 'update-qty/' + id, data);
  }



  /**
   * CART LOCAL STORAGE
   * addCartItemToLocalStorage()
   * getCartItemFromLocalStorage()
   * deleteCartItemFromLocalStorage()
   * deleteAllCartFromLocal()
   */
  addCartItemToLocalStorage(cartItem: Cart) {
    // console.log(product);
    const rawData = localStorage.getItem(DATABASE_KEY.userCart);
    const items = rawData ? JSON.parse(rawData) : null;

    let carts: any[];

    if (!items) {
      carts = [];
      carts.push(cartItem);
    } else {
      carts = items;
      const fIndex = carts.findIndex((o: any) => o.product === cartItem.product);
      if (fIndex === -1) {
        carts.push(cartItem);
      } else {
        carts[fIndex].selectedQty += 1;
      }
    }
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(carts));
  }


  addComboCartItemToLocalStorage(cartItem: Cart) {
    const rawData = localStorage.getItem(DATABASE_KEY.userCart);
    const items = rawData ? JSON.parse(rawData) : null;
    let carts: any[];
    if (!items) {
      carts = [];
      carts.push(cartItem);
    } else {

      carts = items;
      let productPush = false;
      items.map((item: any, j: number) => {
        if (item.cartType == 1) {
          if (item.specialPackage == cartItem.specialPackage) {
            carts[j].selectedQty += 1;
            productPush = true;
          }
        } else {
          if (item.product === cartItem.product) {
            if (item?.selectedVariation && cartItem?.selectedVariation) {
              if (cartItem?.selectedVariation == item.selectedVariation) {
                carts[j].selectedQty += 1;
                productPush = true;
              }
            } else {
              carts[j].selectedQty += 1;
              productPush = true;
            }
          }
        }

      })
      if (!productPush) {
        // console.warn("Out Product PUSH")
        carts.push(cartItem);
      }
    }
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(carts));
  }

  getCartItemFromLocalStorage(): Cart[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const carts = localStorage.getItem(DATABASE_KEY.userCart);
    if (carts === null) {
      return [];
    }
    return JSON.parse(carts) as Cart[];
  }

  // async getCartItemFromLocalStorage(): Promise<any[]> {
  //   const carts = localStorage.getItem(DATABASE_KEY.userCart);
  //
  //   if (!carts) {
  //     return [];
  //   }
  //   try {
  //     const items = JSON.parse(carts) as any[];
  //     if (!items || !items.length) {
  //       return [];
  //     }
  //     const allPromises = items.map(async (item) => {
  //       try {
  //         if (item.cartType === 1) {
  //           const res = await this.comboPackageService.getSpecialPackageById(item.comboPackage).toPromise();
  //           const images = [res.data.image];
  //           return {
  //             ...item,
  //             product: { ...res.data, images },
  //           };
  //         }
  //
  //         const res = await this.productService.getProductById(item.product).toPromise();
  //         return {
  //           ...item,
  //           product: res.data,
  //         };
  //       } catch (error) {
  //         console.error('Error processing cart item:', error);
  //         throw error; // Propagate the error to be handled by Promise.all
  //       }
  //     });
  //
  //     return await Promise.all(allPromises);
  //   } catch (error) {
  //     console.error('Error parsing cart data:', error);
  //     return [];
  //   }
  // }


  deleteCartItemFromLocalStorage(id: string) {
    if (typeof localStorage === 'undefined') return;
    const rawData = localStorage.getItem(DATABASE_KEY.userCart);
    const items: any[] = rawData ? JSON.parse(rawData) : [];
    const filtered = items.filter((el: any) => el.product !== id);
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(filtered));
  }

  deleteAllCartFromLocal(refresh?: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(DATABASE_KEY.userCart);
    }
    this.reloadService.needRefreshCart$(refresh ? refresh : false);
  }

  deleteComboCartItemFromLocalStorage(cartItem: Cart) {
    if (typeof localStorage === 'undefined') return;
    const rawData = localStorage.getItem(DATABASE_KEY.userCart);
    const carts = rawData ? JSON.parse(rawData) : [];
    var newCarts: Cart[] = [];
    carts.map((item: Cart, i: number) => {
      console.warn(cartItem)
      if (item.cartType == 1) {
        if (item.specialPackage != (cartItem.product as Product)?._id) {
          newCarts.push(item)
        }
      } else if (item.cartType == 2) {
        // if (item.specialPackage != (cartItem.product as Product)._id) {
        //   newCarts.push(item)
        // }
      } else {
        if (item.product === (cartItem.product as Product)?._id) {
          if (item.selectedVariation || cartItem.selectedVariation) {
            if ((item.selectedVariation !== (cartItem.selectedVariation as any)?._id)) {
              newCarts.push(item)
            }
          }
        } else {
          newCarts.push(item)
        }
      }

    })
    console.warn(newCarts)
    // const filtered = items.filter(el => el.product !== id);
    localStorage.setItem(DATABASE_KEY.userCart, JSON.stringify(newCarts));
    this.reloadService.needRefreshCart$(true);
  }
  /**
   * CART STORE & GET LOCALLY
   * updateCartList()
   * cartItems()
   */
  public updateCartList(data: Cart[]) {
    this.cartList = data;
    this.needRefreshStoredCart$();
  }

  public get cartItems() {
    return [...this.cartList]
  }



}
