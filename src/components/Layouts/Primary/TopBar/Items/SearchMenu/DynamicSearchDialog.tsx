import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicSearchDialog = dynamic(
  () =>
    import(/* webpackChunkName: "SearchDialog" */ './SearchDialog').then(
      ({ SearchDialog }) => SearchDialog,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
