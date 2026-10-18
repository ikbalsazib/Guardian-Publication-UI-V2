import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { GtmPageView, GtmViewContent } from '../../interfaces/core/gtm.interface';
import { ResponsePayload } from '../../interfaces/core/response-payload.interface';


const API_URL = environment.apiBaseLink + '/api/analytics';

declare global {
  interface Window {
    dataLayer: Array<any>;
    ttq?: any;
    fbq?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GtmService {
  private _isManageFbPixelByTagManager: boolean = false;
  private _facebookPixelId: string = '';
  private _tagManagerId: string = '';
  private readonly isBrowser: boolean;
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser && !window.dataLayer) {
      window.dataLayer = [];
    }
  }


  get facebookPixelId(): string {
    return this._facebookPixelId;
  }

  get tagManagerId(): string {
    return this._tagManagerId;
  }

  get isManageFbPixelByTagManager(): boolean {
    return this._isManageFbPixelByTagManager;
  }


  set isManageFbPixelByTagManager(isManageFbPixelByTagManager: boolean) {
    this._isManageFbPixelByTagManager = isManageFbPixelByTagManager;
  }

  set tagManagerId(tagManagerId: string) {
    this._tagManagerId = tagManagerId;
  }

  set facebookPixelId(facebookPixelId: string) {
    this._facebookPixelId = facebookPixelId;
  }

  /**
   * Facebook Pixel Data Layer
   * trackByFacebookPixel()
   */
  trackByFacebookPixel(eventName: string, data: any = {}, eventId?: string): void {
    if (typeof window === 'undefined') return;
    if (window.fbq) {
      const opts = eventId ? { eventID: eventId } : undefined;
      window.fbq('track', eventName, data, opts);
    }
  }

  /**
   * TikTok Pixel
   * trackByTiktokPixel()
   * Uses same eventId for browser + server deduplication
   */
  trackByTiktokPixel(eventName: string, data: any = {}, eventId?: string): void {
    if (typeof window === 'undefined') return;

    const w: any = window;
    const payload: any = { ...data };
    if (eventId) {
      // TikTok deduplication key
      payload.event_id = eventId;
    }

    // If ttq is ready, fire immediately
    if (w.ttq && typeof w.ttq.track === 'function') {
      w.ttq.track(eventName, payload);
    } else {
      // If not ready, queue it or wait for ready
      if (w.ttq && typeof w.ttq.ready === 'function') {
        w.ttq.ready(() => {
          w.ttq.track(eventName, payload);
        });
      } else {
        // Fallback: queue in ttq array if it exists
        if (w.ttq && Array.isArray(w.ttq)) {
          w.ttq.push(['track', eventName, payload]);
        }
      }
    }
  }


  /**
   * Pushes event data to the dataLayer if running in the browser.
   * @param eventData The event data to be pushed to the dataLayer
   */
  pushToDataLayer(eventData: Record<string, any>): void {
    if (this.isBrowser) {
      window.dataLayer.push(eventData);
    }
  }

  trackPageView(data: GtmPageView) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-theme-page-view`, data);
  }

  trackViewContent(data: GtmViewContent) {
    return this.http.post<any>(`${API_URL}/track-theme-view-content`, data);
  }

  trackAddToCart(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-add-to-cart`, data);
  }

  trackInitiateCheckout(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-initial-checkout`, data);
  }

  trackPurchase(data: any) {
    return this.http.post<any>(`${API_URL}/track-theme-purchase`, data);
  }

  /**
   * Tracks ecommerce event
   * @param data The ecommerce event data
   */
  trackEcommerceEvent(data: GtmViewContent) {
    return this.http.post<any>(`${API_URL}/track-ecommerce-event`, data);
  }



  /**
   * TikTok Events API
   * Server-side tracking with shared event_id
   */
  trackTiktokEvent(data: any) {
    return this.http.post<ResponsePayload>(`${API_URL}/track-tt-event`, data);
  }
}
