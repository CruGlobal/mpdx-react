import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadTaskModalForm = () =>
  import(/* webpackChunkName: "TaskModalForm" */ './TaskModalForm');

export const DynamicTaskModalForm = dynamic(preloadTaskModalForm, {
  loading: DynamicComponentPlaceholder,
});
