import {Product, ProductSpecification} from './product';
import {Variation} from "./variation.interface";

export interface SpecialPackage {
  _id?: string;
  name?: string;
  slug?: string;
  seoDescription?: string;
  seoKeywords?: string;
  description?: string;
  seoTitle?: string;
  image?: string;
  discountType?: number;
  discountAmount?: number;
  salePrice?:number;
  active?:boolean;
  gifts?: ProductSpecification[];
  products?: string[] | Package_Items[] | Product[];
  freeDelivery?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Package_Items {
  _id?: string;
  product?: string | Product;
  hasVariations?: string;
  quantity?: string;
  selectedVariation?: Variation;
}
