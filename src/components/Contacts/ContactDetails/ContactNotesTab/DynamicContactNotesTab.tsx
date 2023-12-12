import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactNotesTab = dynamic(
  () =>
    import(/* webpackChunkName: "ContactNotesTab" */ './ContactNotesTab').then(
      ({ ContactNotesTab }) => ContactNotesTab,
    ),
  { loading: DynamicComponentPlaceholder },
);
