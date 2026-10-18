export interface Banner {
  _id?: string;
  name?: string;
  slug?: string;
  priority?: string;
  image?: string;
  mobileImage?:string;
  bannerType?:string;
  url?:string;
  createdAt?: Date; 
  updatedAt?: Date;
}
