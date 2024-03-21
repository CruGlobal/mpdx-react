import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicCreateContact = dynamic(
  () => import(/* webpackChunkName: "CreateContact" */ './CreateContact'),
  { loading: DynamicComponentPlaceholder },
);
