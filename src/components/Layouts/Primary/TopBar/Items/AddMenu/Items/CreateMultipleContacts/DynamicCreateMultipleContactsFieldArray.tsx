import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCreateMultipleContactsFieldArray = dynamic(
  () =>
    import(
      /* webpackChunkName: "DynamicCreateMultipleContactsFieldArray" */ './CreateMultipleContactsFieldArray'
    ),
  { loading: DynamicComponentPlaceholder },
);
