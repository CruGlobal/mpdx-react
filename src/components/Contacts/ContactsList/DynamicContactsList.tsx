import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicContactsList = dynamic(
  () =>
    import(/* webpackChunkName: "ContactsList" */ './ContactsList').then(
      ({ ContactsList }) => ContactsList,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
