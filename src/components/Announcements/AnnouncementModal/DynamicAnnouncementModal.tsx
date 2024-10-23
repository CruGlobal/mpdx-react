import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadAnnouncementModal = () =>
  import(
    /* webpackChunkName: "AnnouncementModal" */ './AnnouncementModal'
  ).then(({ AnnouncementModal }) => AnnouncementModal);

export const DynamicAnnouncementModal = dynamic(preloadAnnouncementModal, {
  loading: DynamicComponentPlaceholder,
});
