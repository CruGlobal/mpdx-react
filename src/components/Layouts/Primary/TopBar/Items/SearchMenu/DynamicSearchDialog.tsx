import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadSearchDialog = () =>
  import(/* webpackChunkName: "SearchDialog" */ './SearchDialog').then(
    ({ SearchDialog }) => SearchDialog,
  );

export const DynamicSearchDialog = dynamic(preloadSearchDialog, {
  loading: DynamicModalPlaceholder,
});
