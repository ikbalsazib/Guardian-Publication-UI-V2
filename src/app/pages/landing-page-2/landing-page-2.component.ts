import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  computed,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { PLATFORM_ID, TemplateRef } from '@angular/core';

import {
  LandingPage,
  LandingPageBenefitCard,
  LandingPageFaqItem,
  LandingPageTrustItem,
} from '../../interfaces/common/landing-page';
import { LandingPageService } from '../../services/common/landing-page.service';
import { UiService } from '../../services/core/ui.service';
import { SeoService } from '../../services/core/seo.service';
import { ReloadService } from '../../services/core/reload.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { isInvalidPublicSlug } from '../../core/utils/html-content.util';

const DEFAULT_PRIMARY = '#3b82f6';

const DEFAULT_HERO_POINTS = [
  '২০+ পৃষ্ঠার প্র্যাকটিক্যাল গাইড',
  'বাংলায় সহজ ভাষায় লেখা',
  'Instant PDF Download',
];

const DEFAULT_HEADER_BADGES = ['100% Free', 'No Spam', 'Instant Download'];

const DEFAULT_LEAD_TRUST: LandingPageTrustItem[] = [
  { icon: 'lock', title: 'আপনার তথ্য 100% নিরাপদ', subtitle: 'আমরা আপনার তথ্য কখনোই শেয়ার করব না' },
  { icon: 'bolt', title: 'ইনস্ট্যান্ট ডাউনলোড', subtitle: 'তথ্য দেওয়ার সাথে সাথেই PDF ডাউনলোড হবে' },
  { icon: 'shield', title: 'কোনো স্প্যাম নয়', subtitle: 'শুধু গুরুত্বপূর্ণ আপডেটই পাঠানো হবে' },
];

const DEFAULT_BENEFIT_CARDS: LandingPageBenefitCard[] = [
  {
    icon: 'lightbulb',
    title: 'সহজে বোঝা যায়',
    description: 'জটিল শব্দ ছাড়াই স্পষ্ট ও সহজ ব্যাখ্যা',
  },
  {
    icon: 'auto_awesome',
    title: 'ব্যবহারিক উদাহরণ',
    description: 'আজই প্রয়োগ করতে পারবেন এমন বাস্তব উদাহরণ',
  },
  {
    icon: 'bolt',
    title: 'ইনস্ট্যান্ট ডাউনলোড',
    description: 'ফর্ম সাবমিট করলেই সাথে সাথে PDF পাবেন',
  },
  {
    icon: 'rocket_launch',
    title: 'বিগিনার ফ্রেন্ডলি',
    description: 'আগে কোনো অভিজ্ঞতা ছাড়াই শুরু করতে পারবেন',
  },
];

const DEFAULT_FAQ: LandingPageFaqItem[] = [
  {
    question: 'এই কি সত্যিই ফ্রি?',
    answer: 'হ্যাঁ, সম্পূর্ণ ফ্রি। কোনো লুকানো চার্জ বা পেমেন্ট নেই।',
  },
  {
    question: 'ডাউনলোড কিভাবে পাব?',
    answer: 'নিচের ফর্মে নাম, ফোন ও ইমেইল দিয়ে সাবমিট করলেই ডাউনলোড লিংক পাবেন।',
  },
  {
    question: 'কি ধরনের তথ্য দিতে হবে?',
    answer: 'শুধু আপনার নাম, হোয়াটসঅ্যাপ নম্বর এবং Gmail ইমেইল।',
  },
  {
    question: 'আমি কি স্প্যাম পাব?',
    answer: 'না। আমরা আপনার তথ্য কখনোই তৃতীয় পক্ষের সাথে শেয়ার করি না।',
  },
  {
    question: 'PDF কোথায় পাব?',
    answer: 'সাবমিটের পর ডাউনলোড বাটনে ক্লিক করলেই PDF খুলে যাবে।',
  },
];

const DEFAULT_FOOTER_STATS = [
  { icon: 'groups', text: 'Trusted by 10,000+ Users' },
  { icon: 'verified', text: '100% Free Resource' },
  { icon: 'download', text: 'Instant Access' },
];

@Component({
  selector: 'app-landing-page-2',
  templateUrl: './landing-page-2.component.html',
  styleUrls: ['./landing-page-2.component.scss'],
  standalone: true,
  host: {
    class: 'landing-page-2-host',
    '[style.--lp2-primary]': 'primaryColor()',
    '[style.--lp2-primary-dark]': 'primaryColorDark()',
    '[style.--lp2-primary-light]': 'primaryColorLight()',
    '[style.--lp2-primary-soft]': 'primaryColorSoft()',
  },
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    SafeHtmlPipe,
    TranslateModule,
  ],
})
export class LandingPage2Component implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly landingPageService = inject(LandingPageService);
  private readonly uiService = inject(UiService);
  private readonly seoService = inject(SeoService);
  private readonly translate = inject(TranslateService);
  private readonly reloadService = inject(ReloadService);
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly dialog = inject(MatDialog);
  private readonly formSection = viewChild<ElementRef<HTMLElement>>('formSection');
  private readonly pageRoot = viewChild<ElementRef<HTMLElement>>('pageRoot');
  private readonly successDialog = viewChild<TemplateRef<any>>('successDialog');

  landingPage = signal<LandingPage | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  activeFaq = signal<number | null>(0);
  shopInfo = signal<any>(null);

  leadForm = this.fb.group({
    name: ['', Validators.required],
    phoneNo: ['', [Validators.required, Validators.pattern(/^(?:\+?88)?01[3-9]\d{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  primaryColor = computed(
    () => this.landingPage()?.primaryColor?.trim() || DEFAULT_PRIMARY,
  );

  primaryColorDark = computed(() => this.shadeColor(this.primaryColor(), -20));

  primaryColorLight = computed(() => this.shadeColor(this.primaryColor(), 42));

  primaryColorSoft = computed(() => this.hexToRgba(this.primaryColor(), 0.12));

  insidePages = computed(() => this.landingPage()?.insidePages ?? []);

  headerBadges = computed(
    () => this.landingPage()?.headerBadges?.length
      ? this.landingPage()!.headerBadges!
      : DEFAULT_HEADER_BADGES,
  );

  heroPoints = computed(
    () => this.landingPage()?.heroPoints?.length
      ? this.landingPage()!.heroPoints!
      : DEFAULT_HERO_POINTS,
  );

  leadTrustItems = computed(
    () => this.landingPage()?.leadFormTrustItems?.length
      ? this.landingPage()!.leadFormTrustItems!
      : [
          { icon: 'lock', title: this.translate.instant('ln.LP2_InfoSafeTitle'), subtitle: this.translate.instant('ln.LP2_InfoSafeSubtitle') },
          { icon: 'bolt', title: this.translate.instant('ln.LP2_InstantDownloadTitle'), subtitle: this.translate.instant('ln.LP2_InstantDownloadSubtitle') },
          { icon: 'shield', title: this.translate.instant('ln.LP2_NoSpamTitle'), subtitle: this.translate.instant('ln.LP2_NoSpamSubtitle') },
        ],
  );

  benefitCards = computed(
    () => this.landingPage()?.benefitCards?.length
      ? this.landingPage()!.benefitCards!
      : [
          { icon: 'lightbulb', title: this.translate.instant('ln.LP2_EasyToUnderstandTitle'), description: this.translate.instant('ln.LP2_EasyToUnderstandSubtitle') },
          { icon: 'auto_awesome', title: this.translate.instant('ln.LP2_PracticalExamplesTitle'), description: this.translate.instant('ln.LP2_PracticalExamplesSubtitle') },
          { icon: 'bolt', title: this.translate.instant('ln.LP2_InstantDownloadTitle'), description: this.translate.instant('ln.LP2_InstantDownloadBenefitSubtitle') },
          { icon: 'rocket_launch', title: this.translate.instant('ln.LP2_BeginnerFriendlyTitle'), description: this.translate.instant('ln.LP2_BeginnerFriendlySubtitle') },
        ],
  );

  faqItems = computed(
    () => this.landingPage()?.faqItems?.length
      ? this.landingPage()!.faqItems!
      : [
          { question: this.translate.instant('ln.LP2_FAQ1_Q'), answer: this.translate.instant('ln.LP2_FAQ1_A') },
          { question: this.translate.instant('ln.LP2_FAQ2_Q'), answer: this.translate.instant('ln.LP2_FAQ2_A') },
          { question: this.translate.instant('ln.LP2_FAQ3_Q'), answer: this.translate.instant('ln.LP2_FAQ3_A') },
          { question: this.translate.instant('ln.LP2_FAQ4_Q'), answer: this.translate.instant('ln.LP2_FAQ4_A') },
          { question: this.translate.instant('ln.LP2_FAQ5_Q'), answer: this.translate.instant('ln.LP2_FAQ5_A') },
        ],
  );

  footerStats = computed(
    () => this.landingPage()?.footerStats?.length
      ? this.landingPage()!.footerStats!
      : DEFAULT_FOOTER_STATS,
  );

  isFormValid = computed(() => this.leadForm.valid);

  readonly currentYear = new Date().getFullYear();

  private subscriptions: Subscription[] = [];
  private revealObserver?: IntersectionObserver;

  ngOnInit(): void {
    const subRoute = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (!slug || isInvalidPublicSlug(slug)) {
        this.router.navigate(['/']);
        return;
      }
      this.fetchLandingPage(slug);
    });
    this.subscriptions.push(subRoute);

    const subHeader = this.reloadService.getHeaderData.subscribe((res) => {
      if (res) {
        this.shopInfo.set(res);
      }
    });
    this.subscriptions.push(subHeader);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.initRevealObserver();
  }

  private initRevealObserver(): void {
    this.revealObserver?.disconnect();
    const root = this.pageRoot()?.nativeElement;
    if (!root) {
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    root.querySelectorAll('.lp2-animate').forEach((el) => {
      this.revealObserver?.observe(el);
    });
  }

  private fetchLandingPage(slug: string): void {
    this.isLoading.set(true);
    const sub = this.landingPageService.getLandingPageBySlug(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.template !== 'v2') {
            this.router.navigate(['/landing-page', slug]);
            return;
          }
          this.landingPage.set(res.data);
          this.updateSeo(res.data);
          this.isLoading.set(false);
          setTimeout(() => this.initRevealObserver(), 150);
        } else {
          this.seoService.clearSchema();
          this.router.navigate(['/']);
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.seoService.clearSchema();
        this.router.navigate(['/']);
      },
    });
    this.subscriptions.push(sub);
  }

  scrollToForm(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const el = this.formSection()?.nativeElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleFaq(index: number): void {
    this.activeFaq.set(this.activeFaq() === index ? null : index);
  }

  isFaqOpen(index: number): boolean {
    return this.activeFaq() === index;
  }

  linkify(text: string | undefined): string {
    if (!text) return '';
    // If it already contains HTML tags like <a href=...>, just return it
    if (text.toLowerCase().includes('<a ')) return text;
    
    // Match URLs robustly
    const urlRegex = /(https?:\/\/[^\s<]+)/gi;
    return text.replace(urlRegex, (url) => {
      let punctuation = '';
      if (/[.,;?]$/.test(url)) {
        punctuation = url.slice(-1);
        url = url.slice(0, -1);
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline !important; color: #2563eb !important; font-weight: 500; pointer-events: auto !important; cursor: pointer !important;">${url}</a>${punctuation}`;
    });
  }

  showFieldError(controlName: 'name' | 'phoneNo' | 'email'): boolean {
    const control = this.leadForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmitLead(): void {
    if (this.leadForm.invalid || this.isSubmitting()) {
      this.leadForm.markAllAsTouched();
      return;
    }

    const page = this.landingPage();
    if (!page?.slug) {
      return;
    }

    this.isSubmitting.set(true);
    const sub = this.landingPageService
      .submitLead({
        slug: page.slug,
        ...this.leadForm.value,
      } as { slug: string; name: string; phoneNo: string; email: string })
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.success) {
            this.uiService.success(this.translate.instant('ln.LP2_DownloadStarting'));
            const url = res.data?.downloadFileUrl || page.downloadFileUrl;
            const openSuccessPopup = () => {
              const tmpl = this.successDialog();
              if (tmpl) {
                this.dialog.open(tmpl, {
                  width: '400px',
                  maxWidth: '90vw',
                  disableClose: false
                });
              }
            };
            if (url && isPlatformBrowser(this.platformId)) {
              fetch(url)
                .then(res => res.blob())
                .then(blob => {
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = url.substring(url.lastIndexOf('/') + 1) || 'download';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(blobUrl);
                  document.body.removeChild(a);
                  openSuccessPopup();
                })
                .catch(err => {
                  console.error('Download failed, falling back to open in new tab', err);
                  window.open(url, '_blank');
                  openSuccessPopup();
                });
            }
            this.leadForm.reset();
          } else {
            this.uiService.warn(res.message || this.translate.instant('ln.LP2_SubmitFailed'));
          }
        },
        error: () => {
          this.isSubmitting.set(false);
          this.uiService.wrong(this.translate.instant('ln.LP2_SubmitFailedRetry'));
        },
      });
    this.subscriptions.push(sub);
  }

  trustIcon(item: LandingPageTrustItem): string {
    const icon = item.icon?.trim().toLowerCase();
    if (icon === 'lock') return 'lock';
    if (icon === 'bolt') return 'bolt';
    if (icon === 'shield') return 'shield';
    if (icon === 'verified') return 'verified';
    if (icon === 'groups') return 'groups';
    if (icon === 'download') return 'download';
    return icon || 'check_circle';
  }

  trustToneClass(index: number): string {
    const tones = [
      'lp2-trust-list__icon lp2-trust-list__icon--green',
      'lp2-trust-list__icon lp2-trust-list__icon--blue',
      'lp2-trust-list__icon lp2-trust-list__icon--purple',
    ];
    return tones[index % tones.length];
  }

  benefitIcon(card: LandingPageBenefitCard): string {
    const icon = card.icon?.trim().toLowerCase();
    if (icon === 'lightbulb') return 'lightbulb';
    if (icon === 'auto_awesome') return 'auto_awesome';
    if (icon === 'bolt') return 'bolt';
    if (icon === 'rocket_launch') return 'rocket_launch';
    if (icon === 'checklist') return 'checklist';
    if (icon === 'target') return 'track_changes';
    if (icon === 'analytics') return 'bar_chart';
    if (icon === 'schedule') return 'schedule';
    return icon || 'star';
  }

  benefitToneClass(index: number): string {
    return `lp2-feature-card__icon lp2-feature-card__icon--${index % 4}`;
  }

  private updateSeo(page: LandingPage): void {
    this.seoService.updateMetaData({
      title: page.seoTitle || page.title || page.name,
      description: page.seoDescription || page.subtitle || '',
      image: page.heroImage,
      canonicalPath: `/landing-page-2/${page.slug}`,
    });

    this.seoService.setWebPageSchema(
      `/landing-page-2/${page.slug}`,
      page.seoTitle || page.title || page.name || 'Free Resource',
      [{ label: page.title || page.name || 'Free Resource', isCurrent: true }],
    );
  }

  private hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return `rgba(59, 130, 246, ${alpha})`;
    }
    const num = parseInt(normalized, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private shadeColor(hex: string, percent: number): string {
    const normalized = hex.replace('#', '').trim();
    if (!/^[0-9a-f]{6}$/i.test(normalized)) {
      return hex;
    }
    const num = parseInt(normalized, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
