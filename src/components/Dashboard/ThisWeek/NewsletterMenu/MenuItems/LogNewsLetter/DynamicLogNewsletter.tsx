import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const preloadLogNewsletter = () =>
  import(/* webpackChunkName: "LogNewsletter" */ './LogNewsletter');

export const DynamicLogNewsletter = dynamic(preloadLogNewsletter, {
  loading: DynamicModalPlaceholder,
});
