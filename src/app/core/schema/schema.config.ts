export const SCHEMA_CONFIG = {
  baseUrl: 'https://www.guardianpubs.com',
  organizationId: 'https://www.guardianpubs.com/#organization',
  websiteId: 'https://www.guardianpubs.com/#website',
  localBusinessId: 'https://www.guardianpubs.com/#localbusiness',
  name: 'Guardian Publications',
  alternateName: 'গার্ডিয়ান পাবলিকেশন্স',
  foundingDate: '2017',
  description: 'A creative book publishing house in Bangladesh.',
  logo: 'https://www.guardianpubs.com/images/logo/Guardian-Logo.jpg',
  email: 'guardianpubs@gmail.com',
  phones: ['+8801710197558', '+8801998584958'],
  landline: '+8802557163214',
  /** Default LocalBusiness until client confirms retail BookStore at Banglabazar. */
  localBusinessType: 'LocalBusiness' as 'LocalBusiness' | 'BookStore',
  address: {
    streetAddress: '34 Northbrook Hall Road (2nd Floor), Banglabazar',
    addressLocality: 'Dhaka',
    postalCode: '1100',
    addressCountry: 'BD',
  },
  sameAs: [
    'https://www.facebook.com/guardianpubs/',
    'https://www.youtube.com/@Guardianpublication',
  ],
  inLanguage: ['bn-BD', 'en'],
} as const;

export function absoluteUrl(path: string): string {
  if (!path) {
    return SCHEMA_CONFIG.baseUrl;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SCHEMA_CONFIG.baseUrl}${normalized}`;
}
