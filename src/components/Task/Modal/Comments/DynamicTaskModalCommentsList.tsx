import dynamic from 'next/dynamic';
import { DynamicComponentPlaceholder } from 'src/components/DynamicPlaceholders/DynamicComponentPlaceholder';

export const preloadTaskModalCommentsList = () =>
  import(
    /* webpackChunkName: "TaskModalCommentsList" */ './TaskModalCommentsList'
  ).then(({ TaskModalCommentsList }) => TaskModalCommentsList);

export const DynamicTaskModalCommentsList = dynamic(
  preloadTaskModalCommentsList,
  { loading: DynamicComponentPlaceholder },
);
