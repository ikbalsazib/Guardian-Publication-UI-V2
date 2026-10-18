import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';
import { userAuthStateGuard } from './core/guards/user-auth-state.guard';
import { HomeComponent } from './pages/home/home.component';
import { HomeResolver } from './pages/home/home.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: { home: HomeResolver }
  },
  {
    path: 'author-list',
    loadComponent: () => import('./pages/author-list/author-list.component').then(m => m.AuthorListComponent)
  },
  {
    path: 'author/:slug',
    loadComponent: () => import('./pages/author-list/author-details/author-details.component').then(m => m.AuthorDetailsComponent)
  },
  {
    path: 'category-list',
    loadComponent: () => import('./pages/category-list/category-list.component').then(m => m.CategoryListComponent)
  },
  {
    path: 'contact-us',
    loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./pages/compare/compare.component').then(m => m.CompareComponent)
  },
  {
    path: 'login',
    canActivate: [userAuthStateGuard],
    loadComponent: () => import('./pages/user/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registration',
    canActivate: [userAuthStateGuard],
    loadComponent: () => import('./pages/user/registration/registration.component').then(m => m.RegistrationComponent)
  },
  {
    path: 'forget-password',
    canActivate: [userAuthStateGuard],
    loadComponent: () => import('./pages/user/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'pages/:pageSlug',
    loadComponent: () => import('./pages/additional-page-view/additional-page-view.component').then(m => m.AdditionalPageViewComponent)
  },
  {
    path: 'offers',
    loadComponent: () => import('./pages/offers/offers.component').then(m => m.OffersComponent)
  },
  {
    path: 'find-book-location',
    loadComponent: () => import('./pages/find-book-location/find-book-location.component').then(m => m.FindBookLocationComponent)
  },
  {
    path: 'manuscript-submission',
    loadComponent: () => import('./pages/manuscript-submission/manuscript-submission.component').then(m => m.ManuscriptSubmissionComponent)
  },
  {
    path: 'activities',
    loadComponent: () => import('./pages/activities/all-activities/all-activities.component').then(m => m.AllActivitiesComponent)
  },
  {
    path: 'activities/:slug',
    loadComponent: () => import('./pages/activities/activities-details/activities-details.component').then(m => m.ActivitiesDetailsComponent)
  },
  {
    path: 'checkout',

    loadComponent: () => import('./pages/user/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'complete-registration',
    loadComponent: () => import('./pages/complete-registration/complete-registration.component').then(m => m.CompleteRegistrationComponent)
  },
  {
    path: 'payment/success',
    loadComponent: () => import('./pages/payment/payment-status/payment-status.component').then(m => m.PaymentStatusComponent)
  },
  {
    path: 'payment/fail',
    loadComponent: () => import('./pages/payment/payment-status/payment-status.component').then(m => m.PaymentStatusComponent)
  },
  {
    path: 'payment/cancel',
    loadComponent: () => import('./pages/payment/payment-status/payment-status.component').then(m => m.PaymentStatusComponent)
  },
  {
    path: 'all-video',
    loadComponent: () => import('./pages/all-video/all-video.component').then(m => m.AllVideoComponent)
  },
  {
    path: 'special-package',
    loadComponent: () => import('./pages/special-package-list/special-package-list.component').then(m => m.SpecialPackageListComponent)
  },
  {
    path: 'special-package/:slug',
    loadComponent: () => import('./pages/special-package-details/special-package-details.component').then(m => m.SpecialPackageDetailsComponent)
  },
  {
    path: 'landing-page/:slug',
    loadComponent: () => import('./pages/landing-page/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'landing-page-2/:slug',
    loadComponent: () => import('./pages/landing-page-2/landing-page-2.component').then(m => m.LandingPage2Component)
  },
  {
    path: 'landing-page-3/:slug',
    loadComponent: () => import('./pages/landing-page-3/landing-page-3.component').then(m => m.LandingPage3Component)
  },
  {
    path: 'promotion/:slug',
    loadComponent: () => import('./pages/landing-page/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'blogs',
    loadComponent: () => import('./pages/all-blogs/all-blogs.component').then(m => m.AllBlogsComponent)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/all-blogs/blog-details/blog-details.component').then(m => m.BlogDetailsComponent)
  },
  {
    path: 'product-list',
    loadComponent: () => import('./pages/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'product-details/:slug',
    loadComponent: () => import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user/user.component').then(m => m.UserComponent),
    children: [
      {
        path: 'account',
        canActivate: [userGuard],
        loadComponent: () => import('./pages/user/account/account.component').then(m => m.AccountComponent),
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          { path: 'profile', loadComponent: () => import('./pages/user/account/profile/profile.component').then(m => m.ProfileComponent) },
          { path: 'order-list', loadComponent: () => import('./pages/user/account/order-list/order-list.component').then(m => m.OrderListComponent) },
          { path: 'order-details/:orderId', loadComponent: () => import('./pages/user/account/order-details/order-details.component').then(m => m.OrderDetailsComponent) },
          { path: 'wishlist', loadComponent: () => import('./pages/user/account/wish-list/wish-list.component').then(m => m.WishListComponent) },
          { path: 'notification', loadComponent: () => import('./pages/user/account/notification/notification.component').then(m => m.NotificationComponent) },
          { path: 'address', loadComponent: () => import('./pages/user/account/manage-address/manage-address.component').then(m => m.ManageAddressComponent) },
          { path: 'transactions', loadComponent: () => import('./pages/user/account/transactions/transactions.component').then(m => m.TransactionsComponent) },
          { path: 'review', loadComponent: () => import('./pages/user/account/review/review.component').then(m => m.ReviewComponent) },
          { path: 'order-track/:orderId', loadComponent: () => import('./pages/user/account/order-track/order-track.component').then(m => m.OrderTrackComponent) }
        ]
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/user/cart/cart-information/cart-information.component').then(m => m.CartInformationComponent)
      }
    ]
  },
  {
    path: 'coming-soon',
    loadComponent: () => import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) }
];
