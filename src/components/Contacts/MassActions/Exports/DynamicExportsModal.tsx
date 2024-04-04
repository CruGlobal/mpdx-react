import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadExportsModal = () =>
  import(/* webpackChunkName: "ExportsModal" */ './ExportsModal').then(
    ({ ExportsModal }) => ExportsModal,
  );

export const DynamicExportsModal = dynamic(preloadExportsModal, {
  loading: DynamicModalPlaceholder,
});
