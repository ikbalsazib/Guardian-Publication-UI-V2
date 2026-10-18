import { Injectable } from '@angular/core';
// import Swiper core and required modules
import Swiper from 'swiper';
import { EffectCoverflow, EffectFade, Autoplay, Pagination, Navigation } from "swiper/modules";

// Register Swiper modules
// If using Swiper constructor directly or via ngx-swiper-wrapper (unlikely in v12)
// but for manual SwiperCore.use style:
// Swiper.use([EffectCoverflow, EffectFade, Autoplay, Pagination, Navigation]);

@Injectable({
  providedIn: 'root'
})
export class CarouselCntrlService {

  constructor() { }
}
