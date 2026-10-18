import { SubCategory } from "./sub-category.interface";

export interface Category {
  slug?: string;
  _id?: string;
  name?: string;
  nameEn?: string;
  code?: string;
  description?: string;
  serial?: number;
  image?: string;
  mobileImage?: string;
  subCategories?: SubCategory[];
  createdAt?: Date;
  updatedAt?: Date;
}
