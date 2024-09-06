import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadUpdateDonationsModal = () =>
  import(
    /* webpackChunkName: "UpdateDonationsModal" */ './UpdateDonationsModal'
  ).then(({ UpdateDonationsModal }) => UpdateDonationsModal);

export const DynamicUpdateDonationsModal = dynamic(
  preloadUpdateDonationsModal,
  {
    loading: DynamicModalPlaceholder,
  },
);
