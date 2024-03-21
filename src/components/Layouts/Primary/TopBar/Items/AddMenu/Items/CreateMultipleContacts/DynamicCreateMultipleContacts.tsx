import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicCreateMultipleContacts = dynamic(
  () =>
    import(
      /* webpackChunkName: "CreateMultipleContacts" */ './CreateMultipleContacts'
    ).then(({ CreateMultipleContacts }) => CreateMultipleContacts),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
