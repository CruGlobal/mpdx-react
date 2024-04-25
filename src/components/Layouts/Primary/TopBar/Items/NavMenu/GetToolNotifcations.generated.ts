import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetToolNotificationsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetToolNotificationsQuery = (
  { __typename?: 'Query' }
  & { fixCommitmentInfo: (
    { __typename?: 'ContactConnection' }
    & Pick<Types.ContactConnection, 'totalCount'>
  ), fixMailingAddresses: (
    { __typename?: 'ContactConnection' }
    & Pick<Types.ContactConnection, 'totalCount'>
  ), fixSendNewsletter: (
    { __typename?: 'ContactConnection' }
    & Pick<Types.ContactConnection, 'totalCount'>
  ), fixEmailAddresses: (
    { __typename?: 'PersonConnection' }
    & Pick<Types.PersonConnection, 'totalCount'>
  ), fixPhoneNumbers: (
    { __typename?: 'PersonConnection' }
    & Pick<Types.PersonConnection, 'totalCount'>
  ), mergeContacts: (
    { __typename?: 'ContactDuplicateConnection' }
    & Pick<Types.ContactDuplicateConnection, 'totalCount'>
  ), mergePeople: (
    { __typename?: 'PersonDuplicateConnection' }
    & Pick<Types.PersonDuplicateConnection, 'totalCount'>
  ) }
);


export const GetToolNotificationsDocument = gql`
    query GetToolNotifications($accountListId: ID!) {
  fixCommitmentInfo: contacts(
    accountListId: $accountListId
    contactsFilter: {statusValid: false}
  ) {
    totalCount
  }
  fixMailingAddresses: contacts(
    accountListId: $accountListId
    contactsFilter: {addressValid: false}
  ) {
    totalCount
  }
  fixSendNewsletter: contacts(
    accountListId: $accountListId
    contactsFilter: {newsletter: NO_VALUE, status: [PARTNER_FINANCIAL, PARTNER_SPECIAL, PARTNER_PRAY]}
  ) {
    totalCount
  }
  fixEmailAddresses: people(
    accountListId: $accountListId
    peopleFilter: {emailAddressValid: false, deceased: false, contactStatus: [ACTIVE]}
  ) {
    totalCount
  }
  fixPhoneNumbers: people(
    accountListId: $accountListId
    peopleFilter: {phoneNumberValid: false, deceased: false, contactStatus: [ACTIVE]}
  ) {
    totalCount
  }
  mergeContacts: contactDuplicates(accountListId: $accountListId, ignore: false) {
    totalCount
  }
  mergePeople: personDuplicates(accountListId: $accountListId, ignore: false) {
    totalCount
  }
}
    `;
export function useGetToolNotificationsQuery(baseOptions: Apollo.QueryHookOptions<GetToolNotificationsQuery, GetToolNotificationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetToolNotificationsQuery, GetToolNotificationsQueryVariables>(GetToolNotificationsDocument, options);
      }
export function useGetToolNotificationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetToolNotificationsQuery, GetToolNotificationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetToolNotificationsQuery, GetToolNotificationsQueryVariables>(GetToolNotificationsDocument, options);
        }
export type GetToolNotificationsQueryHookResult = ReturnType<typeof useGetToolNotificationsQuery>;
export type GetToolNotificationsLazyQueryHookResult = ReturnType<typeof useGetToolNotificationsLazyQuery>;
export type GetToolNotificationsQueryResult = Apollo.QueryResult<GetToolNotificationsQuery, GetToolNotificationsQueryVariables>;