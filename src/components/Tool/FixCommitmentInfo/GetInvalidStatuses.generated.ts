import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetInvalidStatusesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetInvalidStatusesQuery = (
  { __typename?: 'Query' }
  & { contacts: (
    { __typename?: 'ContactConnection' }
    & { nodes: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id' | 'name' | 'status' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency'>
    )> }
  ) }
);


export const GetInvalidStatusesDocument = gql`
    query GetInvalidStatuses($accountListId: ID!) {
  contacts(
    accountListId: $accountListId
    contactsFilter: {statusValid: false}
    first: 100
  ) {
    nodes {
      id
      name
      status
      pledgeAmount
      pledgeCurrency
      pledgeFrequency
    }
  }
}
    `;
export function useGetInvalidStatusesQuery(baseOptions: Apollo.QueryHookOptions<GetInvalidStatusesQuery, GetInvalidStatusesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInvalidStatusesQuery, GetInvalidStatusesQueryVariables>(GetInvalidStatusesDocument, options);
      }
export function useGetInvalidStatusesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInvalidStatusesQuery, GetInvalidStatusesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInvalidStatusesQuery, GetInvalidStatusesQueryVariables>(GetInvalidStatusesDocument, options);
        }
export type GetInvalidStatusesQueryHookResult = ReturnType<typeof useGetInvalidStatusesQuery>;
export type GetInvalidStatusesLazyQueryHookResult = ReturnType<typeof useGetInvalidStatusesLazyQuery>;
export type GetInvalidStatusesQueryResult = Apollo.QueryResult<GetInvalidStatusesQuery, GetInvalidStatusesQueryVariables>;