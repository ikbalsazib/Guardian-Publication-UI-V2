import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Newsletter } from '../../../interfaces/common/newsletter.interface';
import { NewsletterService } from '../../../services/common/newsletter.service';
import { Subscription } from 'rxjs';
import { UiService } from '../../../services/core/ui.service';
import { ShopInformationService } from '../../../services/common/shop-information.service';
import { ShopInformation } from '../../../interfaces/common/shop-information.interface';
import { ReloadService } from '../../../services/core/reload.service';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterModule
  ]
})
export class FooterComponent implements OnInit, OnDestroy {
  // Signals
  shopInfo = signal<ShopInformation | null>(null);
  isChangeLanguage = signal<boolean>(true);
  isChangeLanguageToggle = signal<string>('bn');
  
  // Data
  dateData = new Date();
  isBrowser: boolean;

  // Dependencies
  private platformId = inject(PLATFORM_ID);
  private newsLetterService = inject(NewsletterService);
  private uiService = inject(UiService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private shopInfoService = inject(ShopInformationService);
  private reloadService = inject(ReloadService);
  public translateService = inject(TranslateService);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    const subLang = this.reloadService.refreshLang$.subscribe(res => {
      if (res === 'bn') {
        this.isChangeLanguageToggle.set('bn');
        this.isChangeLanguage.set(true);
      }
    });

    const subQuery = this.activatedRoute.queryParamMap.subscribe(qParam => {
      if (qParam.get('language') === 'bn') {
        this.onChangeLanguage('bn');
      }
    });

    this.subscriptions.push(subLang, subQuery);

    if (this.isBrowser) {
      this.getShopInfo();
    }
  }

  onSubmit(formElement: NgForm) {
    if (formElement.valid) {
      this.addNewsLetter(formElement.value, formElement);
    } else {
      this.uiService.wrong('Invalid Forms! Please enter your Email');
    }
  }

  private addNewsLetter(data: Newsletter, formElement: NgForm) {
    const subNews = this.newsLetterService.addNewsletter(data).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.uiService.success(res.message);
          formElement.resetForm();
        }
      },
      error: (err: any) => console.log(err)
    });
    this.subscriptions.push(subNews);
  }

  private getShopInfo() {
    const subShop = this.shopInfoService.getShopInformationCached().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.shopInfo.set(res.data);
          setTimeout(() => {
            this.reloadService.passHeaderData(res.data);
          });
        }
      },
      error: (err: any) => console.log(err)
    });
    this.subscriptions.push(subShop);
  }

  onChangeLanguage(language: string) {
    this.router.navigate([], { queryParams: { language } });
    this.isChangeLanguage.set(language === 'bn');
    this.translateService.use(language);
    this.reloadService.needRefreshLang$(language);
  }

  onChangeLanguageToggle(language: string) {
    const nextLang = this.isChangeLanguageToggle() !== language ? language : 'en';
    this.isChangeLanguageToggle.set(nextLang);
    this.isChangeLanguage.set(nextLang === 'bn');
    this.translateService.use(nextLang);
    this.reloadService.needRefreshLang$(nextLang);
    this.router.navigate([], { queryParams: { language: nextLang } });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
