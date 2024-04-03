import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadModal = () =>
  import(/* webpackChunkName: "Modal" */ './Modal');

export const DynamicModal = dynamic(preloadModal, {
  loading: DynamicModalPlaceholder,
});
