import {Area} from "./area.interface";
import {Division} from "./division.interface";
import {Zone} from "./zone.interface";

export interface Praptisthana {
  select: boolean;
  _id?: string;
  name?: string;
  slug?: string;
  priority?: string;
  image?: string;
  address?: string;
  phone?: string;
  area?: Area;
  division?: Division;
  zone?: Zone;
  mobileImage?:string;
  bannerType?:string;
  url?:string;
  createdAt?: Date;
  updatedAt?: Date;
}
