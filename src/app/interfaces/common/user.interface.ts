import {Address} from './address.interface';
import {Cart} from './cart.interface';
import {Area} from "./area.interface";
import {Division} from "./division.interface";
import {Zone} from './zone.interface';
export interface User {
  _id?: string;
  name?: string;
  username?: string;
  phoneNo?: string;
  email?: string;
  password?: string;
  gender?: string;
  birthDate?: any;
  profileImg?: string;
  registrationType?: string;
  carts?: string | Cart[];
  addresses?: string[] | Address[];
  hasAccess?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  success?: boolean;
  userFrom?:string;
  fullName?: string
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  division?: Division;
  area?: Area;
  zone?: Zone;
}

export interface UserAuthResponse {
  success: boolean;
  token?: string;
  tokenExpiredIn?: number;
  data?: any;
  message?: string;
}

export interface UserJwtPayload {
  _id?: string;
  username: string;
}
