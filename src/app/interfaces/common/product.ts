import { Author } from "./author.interface";
import { Brand } from "./brand.interface";
import { Category } from "./category.interface";
import { Publisher } from "./publisher.interface";
import { SubCategory } from "./sub-category.interface";
import { Tag } from "./tag.interface";
import { Variation, VariationOption } from "./variation.interface";

export interface Product {
  // publisher: any;
  _id?: string;
  name: string;
  slug?: string;
  nameEn?: string;
  freeDelivery?: boolean;
  preOrder?: boolean;
  select?: boolean;
  bindType?: string;
  description?: string;
  language?: string;
  taglineEn?: string;
  currentVersionEn?: string;
  ratingTotal?: number;
  dollarPrice?: number;
  ratingCount?: number;
  pdfFile?: string;
  pdfUrl?: string;
  previewImages?: string[];
  previewPageLimit?: number;
  pdfFileSize?: number;
  edition?: string;
  isbn?: string;
  country?: string;
  shortDescription?: string;
  featureTitle?: string;
  tagline?: string;
  costPrice?: number;
  salePrice: number;
  hasTax?: boolean;
  tax?: number;
  sku?: string | any;
  emiMonth?: number[];
  discountType?: number;
  discountAmount?: number;
  images?: string[];
  trackQuantity?: boolean;
  quantity?: number;
  category?: Category;
  subCategory?: SubCategory;
  author?: Author | any;
  tagImage?: string;
  isTag?: boolean;
  brand?: Brand;
  publisher?: Publisher;
  tags?: Tag[] | any;
  specifications?: ProductSpecification[];
  features?: ProductFeature[];
  totalPages?: number | any;
  currentVersion?: string;
  publishedDate?: Date;
  translatorName?: string;
  hasVariations?: boolean;
  variations?: Variation[];
  variationsOptions?: VariationOption[];
  status?: string;
  videoUrl?: string;
  threeMonth?: number;
  sixMonth?: number;
  twelveMonth?: number;
  unit?: string;
  // Seo
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Point
  earnPoint?: boolean;
  pointType?: number;
  pointValue?: number;
  redeemPoint?: boolean;
  redeemType?: number;
  redeemValue?: number;
  createdAt?: Date;
  updatedAt?: Date;

  selectedQty?: number;
  // For Create Order
  orderVariationOption?: VariationOption;
  orderVariation?: string;

  // For Offer
  offerDiscountAmount?: number;
  offerDiscountType?: number;
  resetDiscount?: boolean;
}

interface CatalogInfo {
  _id: string;
  name: string;
  slug: string;
}

export interface ProductSpecification {
  name?: string;
  value?: string;
  type?: string;
}

export interface ProductFeature {
  name?: string;
  value?: string;
}
