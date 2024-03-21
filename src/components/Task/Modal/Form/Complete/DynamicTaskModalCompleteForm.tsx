import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicTaskModalCompleteForm = dynamic(
  () =>
    import(
      /* webpackChunkName: "TaskModalCompleteForm" */ './TaskModalCompleteForm'
    ),
  { loading: DynamicComponentPlaceholder },
);
