import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicContactNotesTab = dynamic(
  () =>
    import(/* webpackChunkName: "ContactNotesTab" */ './ContactNotesTab').then(
      ({ ContactNotesTab }) => ContactNotesTab,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
