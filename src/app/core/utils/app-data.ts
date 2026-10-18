
import {Select} from '../../interfaces/core/select';
import {FileTypes} from '../../enum/file-types.enum';
import {OrderStatus} from '../../enum/order.enum';
import { Currency } from '../../interfaces/core/currency.interface';




export const GENDERS: Select[] = [
  {value: 'male', viewValue: 'Male'},
  {value: 'female', viewValue: 'Female'},
  {value: 'other', viewValue: 'Other'}
];
export const DATA_BOOLEAN: Select[] = [
  {value: true, viewValue: 'Yes'},
  {value: false, viewValue: 'No'},
];

export const FILTER_TAGS:Select[] =[
  {value: 'Kids', viewValue: 'kids'},
  {value: 'Our Published', viewValue: 'our-published'},
  {value: 'New Published', viewValue: 'new-published'},
  {value: 'Coming Soon', viewValue: 'coming-soon'},
  {value: 'Best Selling', viewValue: 'best-selling'},
]
export const PROJECT_SOURCES: Select[] = [
  {value: 'Client Reference', viewValue: 'Client Reference'},
  {value: 'Facebook', viewValue: 'Facebook'},
  {value: 'Fiverr', viewValue: 'Fiverr'},
  {value: 'Linkedin', viewValue: 'Linkedin'},
  {value: 'Local Reference', viewValue: 'Local Reference'},
  {value: 'Website', viewValue: 'Website'},
];
export const CURRENCY: Currency = {
  dollar: '$',
  bdt: '৳',
}
export const FILE_TYPES: Select[] = [
  {value: FileTypes.IMAGE, viewValue: 'Image'},
  {value: FileTypes.VIDEO, viewValue: 'Video'},
  {value: FileTypes.PDF, viewValue: 'Pdf'}
];

export const REPORT_FILTER: Select[] = [
  // {value: 0, viewValue: 'Today'},
  {value: 1, viewValue: 'Last Day'},
  {value: 7, viewValue: 'Last 7 days'},
  {value: 15, viewValue: 'Last 15 days'},
  {value: 30, viewValue: 'Last 30 days'},
  {value: 60, viewValue: 'Last 60 days'},
  {value: 90, viewValue: 'Last 90 days'}
];

export const PRODUCT_STATUS: Select[] = [
  {value: 'draft', viewValue: 'Draft'},
  {value: 'publish', viewValue: 'Publish'},
];


export const EMI_MONTHS: Select[] = [
  {
    value: 3,
    viewValue: '3 Months'
  },
  {
    value: 6,
    viewValue: '6 Months'
  },
  {
    value: 12,
    viewValue: '12 Months'
  },
];

export const DISCOUNT_TYPES: Select[] = [
  {
    value: 1,
    viewValue: 'Percentage'
  },
  {
    value: 2,
    viewValue: 'Cash'
  },
];

export const AMOUNT_TYPES: Select[] = [
  {
    value: 1,
    viewValue: 'Percentage'
  },
  {
    value: 2,
    viewValue: 'Amount'
  },
];

export const CITIES = ['Barisal', 'Bhairab', 'Bogra', 'Brahmanbaria', 'Chandpur', 'Chittagong', 'Chowmuhani', 'Chuadanga', 'Comilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gazipur', 'Jamalpur', 'Jessore', 'Jhenaidah', 'Kaliakair', 'Khulna', 'Kishoreganj', 'Kushtia', 'Maijdee', 'Manikganj', 'Mymensingh', 'Naogaon', 'Narayanganj', 'Narsingdi', 'Nawabganj', 'Pabna', 'Rajshahi', 'Rangpur', 'Saidpur', 'Satkhira', 'Savar', 'Siddhirganj', 'Sirajganj', 'Sreepur', 'Sylhet', 'Tangail', 'Tongi'];
export const ADDRESS_TYPES: string[] = ['Home', 'Work', 'Other'];
export const PAYMENT_TYPES: Select[] = [
  { value: 'cash_on_delivery', viewValue: 'Cash On Delivery'},
  { value: 'bkash', viewValue: 'Bkash'},
  { value: 'rocket', viewValue: 'Rocket'},
  { value: 'nagad', viewValue: 'Nagad'},
  { value: 'credit_card', viewValue: 'Visa/Mastercard'},
];

export type SEO_PAGE_TYPES = 'home_page' | 'blog' | 'special-package' | 'offers' | 'product-list';

export const  PAYMENT_STATUS: Select[] = [
  { value: 'unpaid', viewValue: 'Unpaid'},
  { value: 'paid', viewValue: 'Paid'},
];

export const ORDER_STATUS: Select[] = [
  { value: OrderStatus.PENDING, viewValue: 'Pending'},
  { value: OrderStatus.CONFIRM, viewValue: 'Approved'},
  // { value: OrderStatus.PROCESSING, viewValue: 'Processing'},
  { value: OrderStatus.SHIPPING, viewValue: 'Shipped'},
  { value: OrderStatus.DELIVERED, viewValue: 'Delivered'},
  { value: OrderStatus.CANCEL, viewValue: 'Cancelled'},
  { value: OrderStatus.REFUND, viewValue: 'Refund'},
];

// export const PAYMENT_METHODS: PaymentMethod[] = [
//   // {
//   //   name: 'Bkash',
//   //   image: '/assets/images/payments/bkash-icon.png',
//   //   slug: 'bkash',
//   // },
//   // {
//   //   name: 'Nagad',
//   //   image: '/assets/images/payments/Nagad-Logo.png',
//   //   slug: 'nagad',
//   // },
//   // {
//   //   name: 'Rocket',
//   //   image: '/assets/images/payments/rocket-icon.png',
//   //   slug: 'rocket',
//   // },
//   // {
//   //   name: 'American Express',
//   //   image: '/assets/images/payments/amex-icon.png',
//   //   slug: 'american_express',
//   // },
//   {
//     name: 'Online Pyament',
//     image: '/assets/images/payments/visa-icon.png',
//     slug: 'card',
//   },
//   {
//     name: 'Cash on Delivery',
//     image: '/assets/images/payments/cash-on-delivery.png',
//     slug: 'cash_on_delivery',
//   },
//
// ]

export const PDF_MAKE_LOGO = 'https://api.heriken.co/api/upload/images/herikenlogo.png';

