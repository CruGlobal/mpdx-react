import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEmailNewsletterContactsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetEmailNewsletterContactsQuery = (
  { __typename?: 'Query' }
  & { contacts: (
    { __typename?: 'ContactConnection' }
    & { nodes: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
      & { primaryPerson?: Types.Maybe<(
        { __typename?: 'Person' }
        & Pick<Types.Person, 'id'>
        & { primaryEmailAddress?: Types.Maybe<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email'>
        )> }
      )> }
    )>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
    ) }
  ) }
);


export const GetEmailNewsletterContactsDocument = gql`
    query GetEmailNewsletterContacts($accountListId: ID!, $after: String) {
  contacts(
    accountListId: $accountListId
    contactsFilter: {newsletter: EMAIL, status: ACTIVE}
    first: 100
    after: $after
  ) {
    nodes {
      id
      primaryPerson {
        id
        primaryEmailAddress {
          id
          email
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    `;
export function useGetEmailNewsletterContactsQuery(baseOptions: Apollo.QueryHookOptions<GetEmailNewsletterContactsQuery, GetEmailNewsletterContactsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmailNewsletterContactsQuery, GetEmailNewsletterContactsQueryVariables>(GetEmailNewsletterContactsDocument, options);
      }
export function useGetEmailNewsletterContactsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmailNewsletterContactsQuery, GetEmailNewsletterContactsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmailNewsletterContactsQuery, GetEmailNewsletterContactsQueryVariables>(GetEmailNewsletterContactsDocument, options);
        }
export type GetEmailNewsletterContactsQueryHookResult = ReturnType<typeof useGetEmailNewsletterContactsQuery>;
export type GetEmailNewsletterContactsLazyQueryHookResult = ReturnType<typeof useGetEmailNewsletterContactsLazyQuery>;
export type GetEmailNewsletterContactsQueryResult = Apollo.QueryResult<GetEmailNewsletterContactsQuery, GetEmailNewsletterContactsQueryVariables>;