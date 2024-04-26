import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type NotificationsPreferencesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type NotificationsPreferencesQuery = { __typename?: 'Query' } & {
  notificationPreferences: {
    __typename?: 'NotificationPreferenceConnection';
  } & {
    nodes: Array<
      { __typename?: 'NotificationPreference' } & Pick<
        Types.NotificationPreference,
        'id' | 'app' | 'email' | 'task'
      > & {
          notificationType: { __typename?: 'NotificationType' } & Pick<
            Types.NotificationType,
            'id' | 'descriptionTemplate' | 'type'
          >;
        }
    >;
  };
};

export type NotificationTypesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type NotificationTypesQuery = { __typename?: 'Query' } & {
  notificationTypes: Array<
    { __typename?: 'NotificationType' } & Pick<
      Types.NotificationType,
      'id' | 'type' | 'descriptionTemplate'
    >
  >;
};

export const NotificationsPreferencesDocument = gql`
  query NotificationsPreferences($accountListId: ID!) {
    notificationPreferences(accountListId: $accountListId) {
      nodes {
        id
        app
        email
        notificationType {
          id
          descriptionTemplate
          type
        }
        task
      }
    }
  }
`;
export function useNotificationsPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    NotificationsPreferencesQuery,
    NotificationsPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NotificationsPreferencesQuery,
    NotificationsPreferencesQueryVariables
  >(NotificationsPreferencesDocument, options);
}
export function useNotificationsPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NotificationsPreferencesQuery,
    NotificationsPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NotificationsPreferencesQuery,
    NotificationsPreferencesQueryVariables
  >(NotificationsPreferencesDocument, options);
}
export type NotificationsPreferencesQueryHookResult = ReturnType<
  typeof useNotificationsPreferencesQuery
>;
export type NotificationsPreferencesLazyQueryHookResult = ReturnType<
  typeof useNotificationsPreferencesLazyQuery
>;
export type NotificationsPreferencesQueryResult = Apollo.QueryResult<
  NotificationsPreferencesQuery,
  NotificationsPreferencesQueryVariables
>;
export const NotificationTypesDocument = gql`
  query NotificationTypes {
    notificationTypes {
      id
      type
      descriptionTemplate
    }
  }
`;
export function useNotificationTypesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    NotificationTypesQuery,
    NotificationTypesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NotificationTypesQuery,
    NotificationTypesQueryVariables
  >(NotificationTypesDocument, options);
}
export function useNotificationTypesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NotificationTypesQuery,
    NotificationTypesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NotificationTypesQuery,
    NotificationTypesQueryVariables
  >(NotificationTypesDocument, options);
}
export type NotificationTypesQueryHookResult = ReturnType<
  typeof useNotificationTypesQuery
>;
export type NotificationTypesLazyQueryHookResult = ReturnType<
  typeof useNotificationTypesLazyQuery
>;
export type NotificationTypesQueryResult = Apollo.QueryResult<
  NotificationTypesQuery,
  NotificationTypesQueryVariables
>;
