import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicTaskModalCompleteForm = dynamic(
  () =>
    import(
      /* webpackChunkName: "TaskModalCompleteForm" */ './TaskModalCompleteForm'
    ).then(({ default: TaskModalCompleteForm }) => TaskModalCompleteForm),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
