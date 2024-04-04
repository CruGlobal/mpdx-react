import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadTaskModalLogForm = () =>
  import(/* webpackChunkName: "TaskModalLogForm" */ './TaskModalLogForm');

export const DynamicTaskModalLogForm = dynamic(preloadTaskModalLogForm, {
  loading: DynamicComponentPlaceholder,
});
