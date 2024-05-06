import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicContactFlow = dynamic(
  () =>
    import(/* webpackChunkName: "ContactFlow" */ './ContactFlow').then(
      ({ ContactFlow }) => ContactFlow,
    ),
  { loading: DynamicComponentPlaceholder },
);
