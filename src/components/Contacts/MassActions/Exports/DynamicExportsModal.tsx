import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicExportsModal = dynamic(
  () =>
    import(/* webpackChunkName: "ExportsModal" */ './ExportsModal').then(
      ({ ExportsModal }) => ExportsModal,
    ),
  { loading: DynamicModalPlaceholder },
);
