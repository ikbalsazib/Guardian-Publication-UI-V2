import { Product } from './product';

export interface PromoOffer {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  productDetails?: any;
  bannerImage?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  products?: Product[];
  createdAt?: Date;
  updatedAt?: Date;
}
