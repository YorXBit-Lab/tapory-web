import React from 'react';

const FbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IgIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none"/>
  </svg>
);

const TkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.19a8.28 8.28 0 0 0 4.86 1.56V7.3a4.85 4.85 0 0 1-1.09-.61z"/>
  </svg>
);

export const SOCIAL_PLATFORMS: {
  key: 'facebookUrl' | 'instagramUrl' | 'tiktokUrl';
  bg: string;
  Icon: () => React.ReactElement;
}[] = [
  { key: 'facebookUrl',  bg: '#1877F2', Icon: FbIcon },
  { key: 'instagramUrl', bg: 'linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', Icon: IgIcon },
  { key: 'tiktokUrl',    bg: '#010101', Icon: TkIcon },
];
