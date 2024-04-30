import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadMassActionsMergeModal = () =>
  import(
    /* webpackChunkName: "MassActionsMergeModal" */ './MassActionsMergeModal'
  ).then(({ MassActionsMergeModal }) => MassActionsMergeModal);

export const DynamicMassActionsMergeModal = dynamic(
  preloadMassActionsMergeModal,
  { loading: DynamicModalPlaceholder },
);
