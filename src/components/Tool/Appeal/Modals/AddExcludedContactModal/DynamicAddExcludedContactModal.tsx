import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadAddExcludedContactModal = () =>
  import(
    /* webpackChunkName: "AddExcludedContactModal" */ './AddExcludedContactModal'
  ).then(({ AddExcludedContactModal }) => AddExcludedContactModal);

export const DynamicAddExcludedContactModal = dynamic(
  preloadAddExcludedContactModal,
  {
    loading: DynamicModalPlaceholder,
  },
);
