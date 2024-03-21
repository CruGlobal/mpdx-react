import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const DynamicTaskModalCommentsList = dynamic(
  () =>
    import(
      /* webpackChunkName: "TaskModalCommentsList" */ './TaskModalCommentsList'
    ).then(({ TaskModalCommentsList }) => TaskModalCommentsList),
  { loading: DynamicComponentPlaceholder },
);
