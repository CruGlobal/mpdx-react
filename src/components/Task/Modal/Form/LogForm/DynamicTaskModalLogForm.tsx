import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicTaskModalLogForm = dynamic(
  () => import(/* webpackChunkName: "TaskModalLogForm" */ './TaskModalLogForm'),
  { loading: DynamicComponentPlaceholder },
);
