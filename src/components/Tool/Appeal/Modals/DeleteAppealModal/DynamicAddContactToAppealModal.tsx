import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadDeleteAppealModal = () =>
  import(
    /* webpackChunkName: "DeleteAppealModal" */ './DeleteAppealModal'
  ).then(({ DeleteAppealModal }) => DeleteAppealModal);

export const DynamicDeleteAppealModal = dynamic(preloadDeleteAppealModal, {
  loading: DynamicModalPlaceholder,
});
