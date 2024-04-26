import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
export type TaskRowFragment = { __typename?: 'Task' } & Pick<
  Types.Task,
  | 'id'
  | 'activityType'
  | 'startAt'
  | 'completedAt'
  | 'result'
  | 'starred'
  | 'subject'
  | 'tagList'
> & {
    comments: { __typename?: 'CommentConnection' } & Pick<
      Types.CommentConnection,
      'totalCount'
    >;
    contacts: { __typename?: 'ContactConnection' } & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'name'>
      >;
    };
    user?: Types.Maybe<
      { __typename?: 'UserScopedToAccountList' } & Pick<
        Types.UserScopedToAccountList,
        'id' | 'firstName' | 'lastName'
      >
    >;
  };

export const TaskRowFragmentDoc = gql`
  fragment TaskRow on Task {
    id
    activityType
    startAt
    completedAt
    comments {
      totalCount
    }
    contacts(first: 25) {
      nodes {
        id
        name
      }
    }
    result
    starred
    subject
    tagList
    user {
      id
      firstName
      lastName
    }
  }
`;
