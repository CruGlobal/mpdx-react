import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicMassActionsMergeModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "MassActionsMergeModal" */ './MassActionsMergeModal'
    ).then(({ MassActionsMergeModal }) => MassActionsMergeModal),
  { loading: DynamicModalPlaceholder },
);
