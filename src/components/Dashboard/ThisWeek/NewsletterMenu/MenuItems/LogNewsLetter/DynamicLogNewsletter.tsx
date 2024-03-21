import dynamic from 'next/dynamic';
import { DynamicModalPlaceholder } from 'src/components/DynamicPlaceholders/DynamicModalPlaceholder';

export const DynamicLogNewsletter = dynamic(
  () => import(/* webpackChunkName: "LogNewsletter" */ './LogNewsletter'),
  { loading: DynamicModalPlaceholder },
);
