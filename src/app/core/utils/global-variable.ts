import {environment} from '../../../environments/environment';

export const DATABASE_KEY = Object.freeze({
  loginToken: 'GUARDIAN_TOKEN_' + environment.VERSION,
  loggInSession: 'GUARDIAN_SESSION_' + environment.VERSION,
  encryptAdminLogin: 'GUARDIAN_USER_0_' + environment.VERSION,
  encryptUserLogin: 'GUARDIAN_USER_1_' + environment.VERSION,
  cartsProduct: 'GUARDIAN_USER_CART_' + environment.VERSION,
  productFormData: 'GUARDIAN_PRODUCT_FORM_' + environment.VERSION,
  userCart: 'GUARDIAN_USER_CART_' + environment.VERSION,
  userWishList: 'GUARDIAN_USER_WISHLIST_' + environment.VERSION,
  recommendedProduct: 'GUARDIAN_RECOMMENDED_PRODUCT_' + environment.VERSION,
  userCoupon: 'GUARDIAN_USER_COUPON_' + environment.VERSION,
  userCookieTerm: 'GUARDIAN_COOKIE_TERM' + environment.VERSION,
  selectedShippingAddress: 'GUARDIAN_SELECTED_ADDRESS' + environment.VERSION,
  signUpHoldData: 'OSUDH_KINI_SIGNUP_HOLD_DATA' + environment.VERSION,
  productLayout: 'GUARDIAN_PRODUCT_LAYOUT' + environment.VERSION,
  otpCheck: 'GUARDIAN_USER_OTPCHECK_' + environment.VERSION,
  tempOrderIdSession: 'GUARDIAN_PAYMENT_0_SESSION_ID',
  productsListState: 'GUARDIAN_PRODUCTS_LIST_STATE_' + environment.VERSION,
});
