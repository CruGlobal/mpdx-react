import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicTaskModalForm = dynamic(
  () => import(/* webpackChunkName: "TaskModalForm" */ './TaskModalForm'),
  { loading: DynamicComponentPlaceholder },
);
