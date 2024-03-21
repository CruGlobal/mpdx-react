import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicComponentPlaceholder/DynamicComponentPlaceholder';

export const DynamicTaskModalForm = dynamic(
  () =>
    import(/* webpackChunkName: "TaskModalForm" */ './TaskModalForm').then(
      ({ default: TaskModalForm }) => TaskModalForm,
    ),
  {
    loading: () => <DynamicComponentPlaceholder />,
  },
);
