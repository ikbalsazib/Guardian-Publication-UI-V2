import {Category} from './category.interface';

export interface SubCategory {
  slug: any;
  image: any;
  select: Boolean;
  _id?: string;
  category?: Category;
  name?: string;
  nameEn?: string;
  code?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
