import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactDetailsTab = dynamic(
  () =>
    import(
      /* webpackChunkName: "ContactDetailsTab" */ './ContactDetailsTab'
    ).then(({ ContactDetailsTab }) => ContactDetailsTab),
  { loading: DynamicComponentPlaceholder },
);
