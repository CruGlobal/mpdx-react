import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadCreateMultipleContacts = () =>
  import(
    /* webpackChunkName: "CreateMultipleContacts" */ './CreateMultipleContacts'
  ).then(({ CreateMultipleContacts }) => CreateMultipleContacts);

export const DynamicCreateMultipleContacts = dynamic(
  preloadCreateMultipleContacts,
  { loading: DynamicComponentPlaceholder },
);
