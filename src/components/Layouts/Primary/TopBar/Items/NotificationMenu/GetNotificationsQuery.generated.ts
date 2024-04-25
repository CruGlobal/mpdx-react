import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetNotificationsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetNotificationsQuery = (
  { __typename?: 'Query' }
  & { userNotifications: (
    { __typename?: 'NotificationConnection' }
    & Pick<Types.NotificationConnection, 'unreadCount'>
    & { nodes: Array<(
      { __typename?: 'UserNotification' }
      & Pick<Types.UserNotification, 'id' | 'read'>
      & { notification: (
        { __typename?: 'Notification' }
        & Pick<Types.Notification, 'occurredAt'>
        & { contact: (
          { __typename?: 'Contact' }
          & Pick<Types.Contact, 'id' | 'name'>
        ), donation?: Types.Maybe<(
          { __typename?: 'Donation' }
          & Pick<Types.Donation, 'id'>
          & { amount: (
            { __typename?: 'Money' }
            & Pick<Types.Money, 'amount' | 'currency' | 'conversionDate'>
          ) }
        )>, notificationType: (
          { __typename?: 'NotificationType' }
          & Pick<Types.NotificationType, 'id' | 'type' | 'descriptionTemplate'>
        ) }
      ) }
    )>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
    ) }
  ) }
);


export const GetNotificationsDocument = gql`
    query GetNotifications($accountListId: ID!, $after: String) {
  userNotifications(accountListId: $accountListId, after: $after, first: 20) {
    nodes {
      id
      read
      notification {
        occurredAt
        contact {
          id
          name
        }
        donation {
          id
          amount {
            amount
            currency
            conversionDate
          }
        }
        notificationType {
          id
          type
          descriptionTemplate
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    unreadCount
  }
}
    `;
export function useGetNotificationsQuery(baseOptions: Apollo.QueryHookOptions<GetNotificationsQuery, GetNotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNotificationsQuery, GetNotificationsQueryVariables>(GetNotificationsDocument, options);
      }
export function useGetNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNotificationsQuery, GetNotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNotificationsQuery, GetNotificationsQueryVariables>(GetNotificationsDocument, options);
        }
export type GetNotificationsQueryHookResult = ReturnType<typeof useGetNotificationsQuery>;
export type GetNotificationsLazyQueryHookResult = ReturnType<typeof useGetNotificationsLazyQuery>;
export type GetNotificationsQueryResult = Apollo.QueryResult<GetNotificationsQuery, GetNotificationsQueryVariables>;