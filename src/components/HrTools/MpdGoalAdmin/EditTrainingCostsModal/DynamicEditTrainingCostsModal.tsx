import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadEditTrainingCostsModal = () =>
  import(
    /* webpackChunkName: "EditTrainingCostsModal" */ './EditTrainingCostsModal'
  ).then(({ EditTrainingCostsModal }) => EditTrainingCostsModal);

export const DynamicEditTrainingCostsModal = dynamic(
  preloadEditTrainingCostsModal,
  {
    loading: DynamicModalPlaceholder,
  },
);
