import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetInvalidEmailAddressesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetInvalidEmailAddressesQuery = { __typename?: 'Query' } & {
  people: { __typename?: 'PersonConnection' } & {
    nodes: Array<
      { __typename?: 'Person' } & Pick<
        Types.Person,
        'id' | 'firstName' | 'lastName'
      > & {
          emailAddresses: { __typename?: 'EmailAddressConnection' } & {
            nodes: Array<
              { __typename?: 'EmailAddress' } & Pick<
                Types.EmailAddress,
                'id' | 'primary' | 'email' | 'updatedAt' | 'source'
              >
            >;
          };
        }
    >;
  };
};

export type PersonInvalidEmailFragment = { __typename?: 'Person' } & Pick<
  Types.Person,
  'id' | 'firstName' | 'lastName'
> & {
    emailAddresses: { __typename?: 'EmailAddressConnection' } & {
      nodes: Array<
        { __typename?: 'EmailAddress' } & Pick<
          Types.EmailAddress,
          'id' | 'primary' | 'email' | 'updatedAt' | 'source'
        >
      >;
    };
  };

export type PersonEmailAddressFragment = { __typename?: 'EmailAddress' } & Pick<
  Types.EmailAddress,
  'id' | 'primary' | 'email' | 'updatedAt' | 'source'
>;

export const PersonEmailAddressFragmentDoc = gql`
  fragment PersonEmailAddress on EmailAddress {
    id
    primary
    email
    updatedAt
    source
  }
`;
export const PersonInvalidEmailFragmentDoc = gql`
  fragment PersonInvalidEmail on Person {
    id
    firstName
    lastName
    emailAddresses(first: 25) {
      nodes {
        ...PersonEmailAddress
      }
    }
  }
  ${PersonEmailAddressFragmentDoc}
`;
export const GetInvalidEmailAddressesDocument = gql`
  query GetInvalidEmailAddresses($accountListId: ID!) {
    people(
      accountListId: $accountListId
      peopleFilter: { emailAddressValid: false }
      first: 50
    ) {
      nodes {
        ...PersonInvalidEmail
      }
    }
  }
  ${PersonInvalidEmailFragmentDoc}
`;
export function useGetInvalidEmailAddressesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetInvalidEmailAddressesQuery,
    GetInvalidEmailAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetInvalidEmailAddressesQuery,
    GetInvalidEmailAddressesQueryVariables
  >(GetInvalidEmailAddressesDocument, options);
}
export function useGetInvalidEmailAddressesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvalidEmailAddressesQuery,
    GetInvalidEmailAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetInvalidEmailAddressesQuery,
    GetInvalidEmailAddressesQueryVariables
  >(GetInvalidEmailAddressesDocument, options);
}
export type GetInvalidEmailAddressesQueryHookResult = ReturnType<
  typeof useGetInvalidEmailAddressesQuery
>;
export type GetInvalidEmailAddressesLazyQueryHookResult = ReturnType<
  typeof useGetInvalidEmailAddressesLazyQuery
>;
export type GetInvalidEmailAddressesQueryResult = Apollo.QueryResult<
  GetInvalidEmailAddressesQuery,
  GetInvalidEmailAddressesQueryVariables
>;
