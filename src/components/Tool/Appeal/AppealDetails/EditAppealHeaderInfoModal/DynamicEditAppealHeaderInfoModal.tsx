import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadEditAppealHeaderInfoModal = () =>
  import(
    /* webpackChunkName: "EditAppealHeaderInfoModal" */ './EditAppealHeaderInfoModal'
  ).then(({ EditAppealHeaderInfoModal }) => EditAppealHeaderInfoModal);

export const DynamicEditAppealHeaderInfoModal = dynamic(
  preloadEditAppealHeaderInfoModal,
  { loading: DynamicModalPlaceholder },
);
