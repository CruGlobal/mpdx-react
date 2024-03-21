import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicTaskModalLogForm = dynamic(
  () =>
    import(
      /* webpackChunkName: "TaskModalLogForm" */ './TaskModalLogForm'
    ).then(({ default: TaskModalLogForm }) => TaskModalLogForm),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
