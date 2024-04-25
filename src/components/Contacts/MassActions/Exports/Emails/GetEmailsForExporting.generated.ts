import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEmailsForExportingQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
  numContactIds: Types.Scalars['Int']['input'];
}>;


export type GetEmailsForExportingQuery = (
  { __typename?: 'Query' }
  & { contacts: (
    { __typename?: 'ContactConnection' }
    & { nodes: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
      & { people: (
        { __typename?: 'PersonConnection' }
        & { nodes: Array<(
          { __typename?: 'Person' }
          & { primaryEmailAddress?: Types.Maybe<(
            { __typename?: 'EmailAddress' }
            & Pick<Types.EmailAddress, 'id' | 'email'>
          )> }
        )> }
      ) }
    )> }
  ) }
);


export const GetEmailsForExportingDocument = gql`
    query GetEmailsForExporting($accountListId: ID!, $contactIds: [ID!]!, $numContactIds: Int!) {
  contacts(
    accountListId: $accountListId
    contactsFilter: {ids: $contactIds}
    first: $numContactIds
  ) {
    nodes {
      id
      people(first: 25) {
        nodes {
          primaryEmailAddress {
            id
            email
          }
        }
      }
    }
  }
}
    `;
export function useGetEmailsForExportingQuery(baseOptions: Apollo.QueryHookOptions<GetEmailsForExportingQuery, GetEmailsForExportingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmailsForExportingQuery, GetEmailsForExportingQueryVariables>(GetEmailsForExportingDocument, options);
      }
export function useGetEmailsForExportingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmailsForExportingQuery, GetEmailsForExportingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmailsForExportingQuery, GetEmailsForExportingQueryVariables>(GetEmailsForExportingDocument, options);
        }
export type GetEmailsForExportingQueryHookResult = ReturnType<typeof useGetEmailsForExportingQuery>;
export type GetEmailsForExportingLazyQueryHookResult = ReturnType<typeof useGetEmailsForExportingLazyQuery>;
export type GetEmailsForExportingQueryResult = Apollo.QueryResult<GetEmailsForExportingQuery, GetEmailsForExportingQueryVariables>;