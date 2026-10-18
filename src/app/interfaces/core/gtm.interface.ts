export interface GtmPageView {
  eventId: string;
  event_name: string;
  eventName?: string;
  event_time?: any;
  event_id?: any;
  user_data?: any;
  custom_data?: any;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  email?: string;
  phoneNo?: string;
  clientIp?: string;
  clientUserAgent?: string;
  clientTime?: number; // Current Unix timestamp (in seconds)
}

export interface GtmViewContent extends GtmPageView {
  contentId?: string;
  contentName?: string;
  eventType?: string;
  contentSubCategory?: string;
  contentCategory?: string;
  currency?: string;
  contentType?: string;
  value?: number;
  quantity?: number;
}

