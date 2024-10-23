import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAnnouncementBanner = () =>
  import(
    /* webpackChunkName: "AnnouncementBanner" */ './AnnouncementBanner'
  ).then(({ AnnouncementBanner }) => AnnouncementBanner);

export const DynamicAnnouncementBanner = dynamic(preloadAnnouncementBanner, {
  loading: DynamicComponentPlaceholder,
});
