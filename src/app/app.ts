import { Component, OnInit, inject, PLATFORM_ID, OnDestroy, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SettingService } from './services/common/setting.service';
import { GtmService } from './services/core/gtm.service';
import { SeoService } from './services/core/seo.service';
import { TiktokPixelService } from './services/core/tiktok-pixel.service';
import { UserService } from './services/common/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoaderComponent, NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Guardian-Publication-UI-New';
  isBrowser: boolean;
  isLandingPageRoute = signal(false);

  private platformId = inject(PLATFORM_ID);
  private settingService = inject(SettingService);
  private gtmService = inject(GtmService);
  private tiktokPixelService = inject(TiktokPixelService);
  private router = inject(Router);
  private userService = inject(UserService);
  private seoService = inject(SeoService);

  private subscriptions: Subscription[] = [];

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.initLandingPageRouteTracking();

    if (this.isBrowser) {
      this.userService.autoUserLoggedIn();
      this.initSchemaNavigationCleanup();
      this.scheduleDeferredInit();
    }
  }

  private initLandingPageRouteTracking() {
    const update = (url: string) => {
      this.isLandingPageRoute.set(
        url.startsWith('/landing-page/') ||
        url.startsWith('/landing-page-2/') ||
        url.startsWith('/landing-page-3/') ||
        url.startsWith('/promotion/'),
      );
    };

    let initialUrl = this.router.url;
    try {
      if (initialUrl === '/' && typeof window !== 'undefined' && window?.location?.pathname) {
        initialUrl = window.location.pathname;
      }
    } catch {}
    update(initialUrl);

    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        update(event.url);
      } else if (event instanceof NavigationEnd) {
        update(event.urlAfterRedirects);
      }
    });
    this.subscriptions.push(sub);
  }

  private scheduleDeferredInit() {
    const run = () => {
      this.initGlobalSettings();
      this.initRouterTracking();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => setTimeout(run, 1500), { once: true });
    }
  }

  private initSchemaNavigationCleanup() {
    const sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.seoService.clearSchema();
      }
    });
    this.subscriptions.push(sub);
  }

  private initGlobalSettings() {
    const sub = this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.data && res.data.analytics) {
          const analytics = res.data.analytics;
          this.gtmService.facebookPixelId = analytics.facebookPixelId || '';
          this.gtmService.tagManagerId = analytics.tagManagerId || '';
          this.gtmService.isManageFbPixelByTagManager = analytics.IsManageFbPixelByTagManager || false;

          if (analytics.tiktokPixelId) {
            this.tiktokPixelService.init(analytics.tiktokPixelId);
          }
          // Settings fetched and initialized
        }
      },
      error: (err) => console.error('Error fetching global settings', err)
    });
    this.subscriptions.push(sub);
  }

  private initRouterTracking() {
    const sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const eventId = Date.now().toString() + Math.random().toString(36).substring(2, 9);

        // Track page view locally
        if (this.gtmService.facebookPixelId && !this.gtmService.isManageFbPixelByTagManager) {
          this.gtmService.trackByFacebookPixel('PageView', {}, eventId);
        }

        // Track tiktok browser-side page view
        this.gtmService.trackByTiktokPixel('PageView', {
          page_url: window.location.href,
          page_title: document.title,
          referrer: document.referrer
        }, eventId);

        const payload = {
          eventId: eventId,
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: window.location.href,
          custom_data: {
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer
          }
        };

        this.gtmService.trackPageView(payload).subscribe();
      }
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
