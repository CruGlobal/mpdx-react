import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadCreateContact = () =>
  import(/* webpackChunkName: "CreateContact" */ './CreateContact');

export const DynamicCreateContact = dynamic(preloadCreateContact, {
  loading: DynamicComponentPlaceholder,
});
