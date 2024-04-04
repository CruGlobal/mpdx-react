import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadTaskModalCompleteForm = () =>
  import(
    /* webpackChunkName: "TaskModalCompleteForm" */ './TaskModalCompleteForm'
  );

export const DynamicTaskModalCompleteForm = dynamic(
  preloadTaskModalCompleteForm,
  { loading: DynamicComponentPlaceholder },
);
