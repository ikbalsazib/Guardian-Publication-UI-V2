import { Product } from './product';

export interface LandingPageFeature {
  title?: string;
  value?: string;
}

export interface LandingPageTrustItem {
  icon?: string;
  title?: string;
  subtitle?: string;
}

export interface LandingPageProductInfo {
  _id?: string;
  name?: string;
  nameEn?: string;
  slug?: string;
  images?: string[];
  salePrice?: number;
  discountType?: number;
  discountAmount?: number;
}

export interface LandingPageBenefitCard {
  icon?: string;
  title?: string;
  description?: string;
}

export interface LandingPageFaqItem {
  question?: string;
  answer?: string;
}

export interface LandingPageFooterStat {
  icon?: string;
  text?: string;
}

export interface LandingPageComboGift {
  name?: string;
  nameEn?: string;
  image?: string;
  description?: string;
}

export interface LandingPageComboOffer {
  _id?: string;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  isBestOffer?: boolean;
  pricingMode?: 'fixed' | 'discount';
  salePrice?: number;
  originalPrice?: number;
  discountType?: number;
  discountAmount?: number;
  buyOneGetOne?: boolean;
  freeDelivery?: boolean;
  products?: Product[];
  freeBooks?: Product[];
  freeGifts?: LandingPageComboGift[];
}

export interface LandingPage {
  _id?: string;
  name?: string;
  slug?: string;
  status?: string;
  template?: string;
  brandTagline?: string;
  badgeText?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  heroImage?: string;
  images?: string[];
  description?: string;
  featuresTitle?: string;
  features?: LandingPageFeature[];
  featuresContent?: string;
  heroPoints?: string[];
  resourceCardTitle?: string;
  resourceCardSubtitle?: string;
  leadFormTitle?: string;
  leadFormSubtitle?: string;
  leadFormNote?: string;
  leadFormButtonText?: string;
  leadFormTrustItems?: LandingPageTrustItem[];
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  benefitCards?: LandingPageBenefitCard[];
  faqTitle?: string;
  faqSubtitle?: string;
  faqItems?: LandingPageFaqItem[];
  headerBadges?: string[];
  footerStats?: LandingPageFooterStat[];
  downloadFileUrl?: string;
  insidePagesTitle?: string;
  insidePages?: string[];
  trustItems?: LandingPageTrustItem[];
  productSectionTitle?: string;
  productSectionSubtitle?: string;
  salePrice?: number;
  originalPrice?: number;
  freeDeliveryThreshold?: number;
  discountPercent?: number;
  primaryColor?: string;
  videoUrl?: string;
  endDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  products?: Product[];
  comboOffers?: LandingPageComboOffer[];
  productInfo?: LandingPageProductInfo[];
  giftPackageTitle?: string;
  giftPackageSubtitle?: string;
  giftPackagePoints?: string[];
  giftPackagePrice?: number;
  giftPackageImage?: string;
  testimonialTitle?: string;
  testimonialRating?: number;
  testimonialText?: string;
  testimonialReviewerName?: string;
  testimonialReviewerImage?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}
