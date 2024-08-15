import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadDeleteAppealContactModal = () =>
  import(
    /* webpackChunkName: "DeleteAppealContactModal" */ './DeleteAppealContactModal'
  ).then(({ DeleteAppealContactModal }) => DeleteAppealContactModal);

export const DynamicDeleteAppealContactModal = dynamic(
  preloadDeleteAppealContactModal,
  {
    loading: DynamicModalPlaceholder,
  },
);
