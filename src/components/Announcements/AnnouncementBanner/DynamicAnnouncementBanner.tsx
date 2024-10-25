import dynamic from 'next/dynamic';

export const preloadAnnouncementBanner = () =>
  import(
    /* webpackChunkName: "AnnouncementBanner" */ './AnnouncementBanner'
  ).then(({ AnnouncementBanner }) => AnnouncementBanner);

export const DynamicAnnouncementBanner = dynamic(preloadAnnouncementBanner);
