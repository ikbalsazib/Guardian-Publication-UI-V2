import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material/material.module';
import { ShopeCategoryCardModule } from 'src/app/shared/components/shope-category-card/shope-category-card.module';
import { CarouselSliderComponent } from './carousel-slider/carousel-slider.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ShopByCategoryComponent } from './shop-by-category/shop-by-category.component';
import {CategoryCardOneModule} from "../../shared/components/category-card-one/category-card-one.module";
import {CarouselBannerOneModule} from "../../shared/components/carousel-banner-one/carousel-banner-one.module";
import { PosterComponent } from './poster/poster.component';
import { ArticlesComponent } from './articles/articles.component';
import {BlogCardOneModule} from "../../shared/components/blog-card-one/blog-card-one.module";
import { SpecialPackageComponent } from './special-package/special-package.component';
import {NewPublishedComponent} from "./new-published/new-published.component";
import {ProductCardOneModule} from "../../shared/components/product-card-one/product-card-one.module";
import { KidsBookComponent } from './kids-book/kids-book.component';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import {UserReviewsCardOneModule} from "../../shared/components/user-reviews-card-one/user-reviews-card-one.module";
import {UpcomingBestSellerComponent} from "./upcoming-best-seller/upcoming-best-seller.component";
import {ProductCardTwoModule} from "../../shared/components/product-card-two/product-card-two.module";
import { OurPublicationComponent } from './our-publication/our-publication.component';
import {
  SpecialPackageCardOneModule
} from "../../shared/components/special-package-card-one/special-package-card-one.module";
import {PosterCardOneModule} from "../../shared/components/poster-card-one/poster-card-one.module";
import {AuthorCardOneModule} from "../../shared/components/author-card-one/author-card-one.module";
import {CategoryCardTwoModule} from "../../shared/components/category-card-two/category-card-two.module";
import { CategoryLoaderCardModule } from 'src/app/shared/skeleton-loader/category-loader-card/category-loader-card.module';
import { CarouselSliderLoaderModule } from 'src/app/shared/skeleton-loader/carousel-slider-loader/carousel-slider-loader.module';
import { SmallBannerLoaderModule } from 'src/app/shared/skeleton-loader/small-banner-loader/small-banner-loader.module';
import { CardOneLoaderModule } from 'src/app/shared/skeleton-loader/card-one-loader/card-one-loader.module';
import { SpecialPackageLoaderModule } from '../../shared/skeleton-loader/special-package-loader/special-package-loader.module';
import { BlogLoaderModule } from 'src/app/shared/skeleton-loader/blog-loader/blog-loader.module';
import { YoutubeVideoComponent } from './youtube-video/youtube-video.component';
import {PipesModule} from "../../shared/pipes/pipes.module";
import {TranslateModule} from "@ngx-translate/core";
import {YoutubeLoaderModule} from "../../shared/skeleton-loader/youtube-loader/youtube-loader.module";
import {LazyLoadComponentModule} from "../../shared/directives/lazy-load-component/lazy-load-component.module";
import {PosterCardTwoModule} from "../../shared/components/poster-card-two/poster-card-two.module";
import { PopularBookComponent } from './popular-book/popular-book.component';


@NgModule({
  declarations: [
  ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        MaterialModule,
        ShopeCategoryCardModule,
        CategoryCardOneModule,
        CarouselBannerOneModule,
        BlogCardOneModule,
        ProductCardOneModule,
        UserReviewsCardOneModule,
        ProductCardTwoModule,
        SpecialPackageCardOneModule,
        PosterCardOneModule,
        AuthorCardOneModule,
        CategoryCardTwoModule,
        CategoryLoaderCardModule,
        CarouselSliderLoaderModule,
        SmallBannerLoaderModule,
        CardOneLoaderModule,
        SpecialPackageLoaderModule,
        BlogLoaderModule,
        PipesModule,
        TranslateModule,
        YoutubeLoaderModule,
        LazyLoadComponentModule,
        PosterCardTwoModule,
        // Standalone Components
        HomeComponent,
        CarouselSliderComponent,
        ShopByCategoryComponent,
        PosterComponent,
        ArticlesComponent,
        SpecialPackageComponent,
        NewPublishedComponent,
        KidsBookComponent,
        UserReviewsComponent,
        UpcomingBestSellerComponent,
        OurPublicationComponent,
        YoutubeVideoComponent,
        PopularBookComponent,
    ]

})
export class HomeModule {
}
