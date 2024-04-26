import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetContactDuplicatesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetContactDuplicatesQuery = { __typename?: 'Query' } & {
  contactDuplicates: { __typename?: 'ContactDuplicateConnection' } & {
    nodes: Array<
      { __typename?: 'ContactDuplicate' } & Pick<
        Types.ContactDuplicate,
        'id' | 'reason'
      > & {
          recordOne: { __typename?: 'Contact' } & Pick<
            Types.Contact,
            'id' | 'name' | 'status' | 'source' | 'createdAt'
          > & {
              primaryAddress?: Types.Maybe<
                { __typename?: 'Address' } & Pick<
                  Types.Address,
                  'street' | 'city' | 'state' | 'postalCode'
                >
              >;
            };
          recordTwo: { __typename?: 'Contact' } & Pick<
            Types.Contact,
            'id' | 'name' | 'status' | 'source' | 'createdAt'
          > & {
              primaryAddress?: Types.Maybe<
                { __typename?: 'Address' } & Pick<
                  Types.Address,
                  'street' | 'city' | 'state' | 'postalCode'
                >
              >;
            };
        }
    >;
  };
};

export type BasicAddressInfoFragment = { __typename?: 'Address' } & Pick<
  Types.Address,
  'street' | 'city' | 'state' | 'postalCode'
>;

export type RecordInfoFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  'id' | 'name' | 'status' | 'source' | 'createdAt'
> & {
    primaryAddress?: Types.Maybe<
      { __typename?: 'Address' } & Pick<
        Types.Address,
        'street' | 'city' | 'state' | 'postalCode'
      >
    >;
  };

export const BasicAddressInfoFragmentDoc = gql`
  fragment BasicAddressInfo on Address {
    street
    city
    state
    postalCode
  }
`;
export const RecordInfoFragmentDoc = gql`
  fragment RecordInfo on Contact {
    id
    name
    status
    source
    createdAt
    primaryAddress {
      ...BasicAddressInfo
    }
  }
  ${BasicAddressInfoFragmentDoc}
`;
export const GetContactDuplicatesDocument = gql`
  query GetContactDuplicates($accountListId: ID!) {
    contactDuplicates(accountListId: $accountListId, first: 50) {
      nodes {
        id
        reason
        recordOne {
          ...RecordInfo
        }
        recordTwo {
          ...RecordInfo
        }
      }
    }
  }
  ${RecordInfoFragmentDoc}
`;
export function useGetContactDuplicatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContactDuplicatesQuery,
    GetContactDuplicatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetContactDuplicatesQuery,
    GetContactDuplicatesQueryVariables
  >(GetContactDuplicatesDocument, options);
}
export function useGetContactDuplicatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContactDuplicatesQuery,
    GetContactDuplicatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetContactDuplicatesQuery,
    GetContactDuplicatesQueryVariables
  >(GetContactDuplicatesDocument, options);
}
export type GetContactDuplicatesQueryHookResult = ReturnType<
  typeof useGetContactDuplicatesQuery
>;
export type GetContactDuplicatesLazyQueryHookResult = ReturnType<
  typeof useGetContactDuplicatesLazyQuery
>;
export type GetContactDuplicatesQueryResult = Apollo.QueryResult<
  GetContactDuplicatesQuery,
  GetContactDuplicatesQueryVariables
>;
