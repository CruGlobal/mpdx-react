import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type InvalidAddressesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type InvalidAddressesQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'name' | 'status'
      > & {
          addresses: { __typename?: 'AddressConnection' } & {
            nodes: Array<
              { __typename?: 'Address' } & Pick<
                Types.Address,
                | 'id'
                | 'street'
                | 'city'
                | 'state'
                | 'region'
                | 'metroArea'
                | 'country'
                | 'postalCode'
                | 'primaryMailingAddress'
                | 'source'
                | 'location'
                | 'createdAt'
                | 'historic'
              >
            >;
          };
        }
    >;
  };
};

export type ContactAddressFragment = { __typename?: 'Address' } & Pick<
  Types.Address,
  | 'id'
  | 'street'
  | 'city'
  | 'state'
  | 'region'
  | 'metroArea'
  | 'country'
  | 'postalCode'
  | 'primaryMailingAddress'
  | 'source'
  | 'location'
  | 'createdAt'
  | 'historic'
>;

export const ContactAddressFragmentDoc = gql`
  fragment ContactAddress on Address {
    id
    street
    city
    state
    region
    metroArea
    country
    postalCode
    primaryMailingAddress
    source
    location
    createdAt
    historic
  }
`;
export const InvalidAddressesDocument = gql`
  query InvalidAddresses($accountListId: ID!) {
    contacts(
      accountListId: $accountListId
      contactsFilter: { addressValid: false }
      first: 100
    ) {
      nodes {
        id
        name
        status
        addresses(first: 25) {
          nodes {
            ...ContactAddress
          }
        }
      }
    }
  }
  ${ContactAddressFragmentDoc}
`;
export function useInvalidAddressesQuery(
  baseOptions: Apollo.QueryHookOptions<
    InvalidAddressesQuery,
    InvalidAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<InvalidAddressesQuery, InvalidAddressesQueryVariables>(
    InvalidAddressesDocument,
    options,
  );
}
export function useInvalidAddressesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    InvalidAddressesQuery,
    InvalidAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    InvalidAddressesQuery,
    InvalidAddressesQueryVariables
  >(InvalidAddressesDocument, options);
}
export type InvalidAddressesQueryHookResult = ReturnType<
  typeof useInvalidAddressesQuery
>;
export type InvalidAddressesLazyQueryHookResult = ReturnType<
  typeof useInvalidAddressesLazyQuery
>;
export type InvalidAddressesQueryResult = Apollo.QueryResult<
  InvalidAddressesQuery,
  InvalidAddressesQueryVariables
>;
