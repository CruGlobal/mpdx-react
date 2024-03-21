import dynamic from 'next/dynamic';

export const DynamicSearchDialog = dynamic(() =>
  import(/* webpackChunkName: "SearchDialog" */ './SearchDialog').then(
    ({ SearchDialog }) => SearchDialog,
  ),
);
