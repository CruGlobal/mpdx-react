import dynamic from 'next/dynamic';

export const preloadAnnouncementModal = () =>
  import(
    /* webpackChunkName: "AnnouncementModal" */ './AnnouncementModal'
  ).then(({ AnnouncementModal }) => AnnouncementModal);

export const DynamicAnnouncementModal = dynamic(preloadAnnouncementModal);
