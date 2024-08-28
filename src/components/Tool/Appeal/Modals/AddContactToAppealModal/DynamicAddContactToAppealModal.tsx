import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadAddContactToAppealModal = () =>
  import(
    /* webpackChunkName: "AddContactToAppealModal" */ './AddContactToAppealModal'
  ).then(({ AddContactToAppealModal }) => AddContactToAppealModal);

export const DynamicAddContactToAppealModal = dynamic(
  preloadAddContactToAppealModal,
  { loading: DynamicModalPlaceholder },
);
