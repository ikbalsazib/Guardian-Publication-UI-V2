
import { User } from './user.interface';
import { Product } from './product';
import { SpecialPackage } from "./special-package.interface";
import { VariationOption } from "./variation.interface";

export interface Cart {
  _id?: string;
  product?: string | Product;
  specialPackage?: any | SpecialPackage;
  selectedVariation?: VariationOption;
  cartType?: number;
  user?: string | User;
  selectedQty?: number;
  size?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
