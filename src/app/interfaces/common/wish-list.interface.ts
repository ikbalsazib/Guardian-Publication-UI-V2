import { Product } from "./product";

export interface WishList {
  _id?: string;
  product?: any;
  user?: string | any;
  selectedQty?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
