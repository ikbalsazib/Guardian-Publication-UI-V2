export interface Blog {
  _id?: string;
  name?: string;
  seoTitle?: string;
  slug?: string;
  image?: string;
  authorName?: string;
  shortDescEn?: string;
  nameEn?: string;
  mobileImage?: string;
  seoDescription?: string;
  seoKeywords?: string;
  description?: string;
  shortDesc?:string;
  priority?:number;
  totalView?:number;
  createdAt?: Date;
  updatedAt?: Date;
}
