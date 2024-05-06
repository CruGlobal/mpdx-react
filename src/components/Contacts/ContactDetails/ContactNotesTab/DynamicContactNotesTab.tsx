import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadContactNotesTab = () =>
  import(/* webpackChunkName: "ContactNotesTab" */ './ContactNotesTab').then(
    ({ ContactNotesTab }) => ContactNotesTab,
  );

export const DynamicContactNotesTab = dynamic(preloadContactNotesTab, {
  loading: DynamicComponentPlaceholder,
});
