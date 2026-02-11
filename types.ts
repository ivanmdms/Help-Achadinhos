
export enum SocialFormat {
  INSTAGRAM_POST = 'INSTAGRAM_POST',
  INSTAGRAM_REELS = 'INSTAGRAM_REELS',
  FACEBOOK_POST = 'FACEBOOK_POST',
  FACEBOOK_COVER = 'FACEBOOK_COVER',
  CUSTOM = 'CUSTOM'
}

export interface FormatConfig {
  label: string;
  ratio: string;
  description: string;
  icon: string;
}

export interface ResizeRequest {
  image: string; // base64
  format: SocialFormat;
  customWidth?: number;
  customHeight?: number;
}
