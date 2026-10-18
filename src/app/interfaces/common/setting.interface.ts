export interface Setting {
  _id?: string;
  analytics?: {
    tagManagerId?: string;
    facebookPixelId?: string;
    facebookPixelAccessToken?: string;
    IsManageFbPixelByTagManager?: boolean;
    isEnablePixelTestEvent?: boolean;
    facebookPixelTestEventId?: string;
    tiktokPixelId?: string;
    tiktokAccessToken?: string;
    tiktokTestEventCode?: string;
    isPurchaseEventOnConfirm?: boolean;
  };
}
