import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const TIKTOK_API_URL = environment.apiBaseLink + '/api/tiktok';

@Injectable({ providedIn: 'root' })
export class TiktokPixelService {
  private initialized = false;
  private currentId: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
  ) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Initialize TikTok Pixel dynamically using pixelId
   * Mirrors Facebook Pixel dynamic init pattern.
   * Matches reference implementation from saleecom-landing-web-ui
   */
  init(pixelId: string | null) {
    if (!this.isBrowser || !pixelId) return;
    if (this.initialized && this.currentId === pixelId) return;

    this.ensureTtqLoaded(pixelId);

    this.initialized = true;
    this.currentId = pixelId;
  }

  /**
   * Dynamically inject official TikTok Pixel base script
   * Manual PageView control (no auto ttq.page() call)
   * Matches Facebook Pixel pattern for manual event control
   */
  private ensureTtqLoaded(pixelId: string) {
    const w: any = window;
    if (w.ttq) return; // already loaded

    (function (w: any, d: Document, t: string, pid: string) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie',
        'holdConsent',
        'revokeConsent',
        'grantConsent',
      ];
      ttq.setAndDefer = function (tt: any, e: string) {
        tt[e] = function () {
          tt.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function (id: string) {
        const inst = ttq._i[id] || [];
        for (let i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(inst, ttq.methods[i]);
        }
        return inst;
      };
      ttq.load = function (id: string, config?: any) {
        const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        const o = config && config.partner;
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        // Disable auto page tracking in config
        ttq._o[id] = { ...config, autoPageView: false };
        const n = d.createElement('script');
        n.type = 'text/javascript';
        n.async = true;
        n.src = r + '?sdkid=' + id + '&lib=' + t;
        const s = d.getElementsByTagName('script')[0];
        s?.parentNode?.insertBefore(n, s);
      };

      // Load TikTok Pixel with autoPageView disabled
      // This prevents automatic LandingPageView event
      // Auto Advanced Matching is enabled by default - it automatically detects form fields
      // Manual Advanced Matching is handled by passing email/phone_number in event payloads
      ttq.load(pid, { autoPageView: false });
    })(w, this.document, 'ttq', pixelId);
  }

  /**
   * Browser-side TikTok Pixel tracking
   * Matches Facebook Pixel trackByFacebookPixel pattern
   * If eventId provided, it is passed as event_id for deduplication
   */
  track(eventName: string, data: any = {}, eventId?: string): void {
    if (!this.isBrowser) return;
    const w: any = window;
    if (!w.ttq) return;

    const payload = eventId ? { ...data, event_id: eventId } : data;
    w.ttq.track(eventName, payload);
  }

  /**
   * Fire PageView event (manual control)
   * Matches Facebook Pixel manual PageView pattern
   */
  page(eventId?: string): void {
    if (!this.isBrowser) return;
    const w: any = window;
    if (!w.ttq) return;

    const payload = eventId ? { event_id: eventId } : {};
    w.ttq.page(payload);
  }

  /**
   * Sends server-side TikTok event to NestJS backend
   * Same eventId as browser pixel for deduplication
   * Matches Facebook CAPI trackServerEvent pattern
   * Automatically includes ttclid and ttp if available
   */
  trackServerEvent(payload: {
    event: string;
    eventId: string;
    value?: number;
    currency?: string;
    contents?: any[];
    email?: string;
    phoneNo?: string;
    externalId?: string;
    ttclid?: string;
    ttp?: string;
    timestamp?: string;
    customProperties?: Record<string, any>;
  }) {
    // Get TikTok params (similar to Facebook getFbCookies pattern)
    const tiktokParams = this.getTiktokParams();
    
    // Prioritize payload values, then use auto-fetched values
    const ttclidValue = payload.ttclid || tiktokParams.ttclid;
    const ttpValue = payload.ttp || tiktokParams.ttp;
    
    // Build final payload with all fields
    const finalPayload: any = {
      event: payload.event,
      eventId: payload.eventId,
      timestamp: payload.timestamp,
      email: payload.email,
      phoneNo: payload.phoneNo,
      externalId: payload.externalId,
      value: payload.value,
      currency: payload.currency,
      contents: payload.contents,
      customProperties: payload.customProperties,
    };
    
    // Always include ttclid and ttp if they have values
    if (ttclidValue && ttclidValue.trim() !== '') {
      finalPayload.ttclid = ttclidValue.trim();
    }
    if (ttpValue && ttpValue.trim() !== '') {
      finalPayload.ttp = ttpValue.trim();
    }

    // Debug logging
    console.log('TikTok server event payload:', finalPayload);
    console.log('TikTok tracking params check:', { 
      tiktokParams: tiktokParams,
      ttclidInPayload: ttclidValue || 'not included',
      ttpInPayload: ttpValue || 'not included',
      url: this.isBrowser ? window.location.href : 'N/A'
    });
    
    this.http
      .post(`${TIKTOK_API_URL}/track-theme-event`, finalPayload)
      .subscribe({
        next: () => {},
        error: (err) => {
          console.error('TikTok server event failed', err);
        },
      });
  }

  /**
   * Get TikTok cookies and parameters (similar to Facebook getFbCookies)
   * Returns ttclid and ttp for TikTok Events API
   */
  getTiktokParams(): { ttclid?: string; ttp?: string } {
    const out: { ttclid?: string; ttp?: string } = {};
    
    if (!this.isBrowser) return out;
    
    try {
      // Parse cookies (similar to Facebook cookie parsing)
      const cookieStr = document.cookie || '';
      const jar: Record<string, string> = {};
      cookieStr.split(';').forEach(pair => {
        const trimmed = pair.trim();
        if (!trimmed) return;
        const eq = trimmed.indexOf('=');
        if (eq === -1) return;
        const k = trimmed.slice(0, eq);
        const v = trimmed.slice(eq + 1);
        jar[k] = decodeURIComponent(v);
      });

      // Get ttp from cookie (TikTok Pixel sets this automatically)
      if (jar['ttp']) {
        out.ttp = jar['ttp'];
      }

      // Get ttclid from URL parameter (similar to fbclid handling)
      const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost');
      const ttclidFromUrl = url.searchParams.get('ttclid');
      
      if (ttclidFromUrl) {
        out.ttclid = ttclidFromUrl;
        
        // Store ttclid in sessionStorage for later use (similar to fbc storage)
        // TikTok doesn't use cookie for ttclid, but we can store it for the session
        try {
          sessionStorage.setItem('_ttclid', ttclidFromUrl);
        } catch (e) {
          // sessionStorage might not be available
        }
      } else {
        // Check if we stored it in sessionStorage from previous page
        try {
          const storedTtclid = sessionStorage.getItem('_ttclid');
          if (storedTtclid) {
            out.ttclid = storedTtclid;
          }
        } catch (e) {
          // sessionStorage might not be available
        }
      }

      // Also check TikTok Pixel object for ttp (if cookie method didn't work)
      if (!out.ttp) {
        const w: any = window;
        if (w.ttq) {
          // TikTok Pixel might store ttp in the object
          if (w.ttq._ttp) out.ttp = w.ttq._ttp;
          if (w.ttq.ttp && !out.ttp) out.ttp = w.ttq.ttp;
        }
      }

    } catch (error) {
      console.warn('Error getting TikTok params:', error);
    }
    
    return out;
  }

  /**
   * Get ttclid from URL query parameter or sessionStorage
   * Similar to Facebook fbc handling
   */
  getTtclid(): string | undefined {
    if (!this.isBrowser) return undefined;
    
    const params = this.getTiktokParams();
    return params.ttclid;
  }

  /**
   * Get ttp from first-party cookie or TikTok Pixel object
   * Similar to Facebook fbp handling
   */
  getTtp(): string | undefined {
    if (!this.isBrowser) return undefined;
    
    const params = this.getTiktokParams();
    return params.ttp;
  }
}

