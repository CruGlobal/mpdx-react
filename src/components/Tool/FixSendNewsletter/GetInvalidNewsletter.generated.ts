import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetInvalidNewsletterQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetInvalidNewsletterQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'name' | 'status' | 'source'
      > & {
          primaryAddress?: Types.Maybe<
            { __typename?: 'Address' } & Pick<
              Types.Address,
              | 'street'
              | 'city'
              | 'state'
              | 'postalCode'
              | 'source'
              | 'createdAt'
            >
          >;
          primaryPerson?: Types.Maybe<
            { __typename?: 'Person' } & Pick<
              Types.Person,
              'firstName' | 'lastName'
            > & {
                primaryEmailAddress?: Types.Maybe<
                  { __typename?: 'EmailAddress' } & Pick<
                    Types.EmailAddress,
                    'email'
                  >
                >;
              }
          >;
        }
    >;
  };
};

export type ContactPrimaryAddressFragment = { __typename?: 'Address' } & Pick<
  Types.Address,
  'street' | 'city' | 'state' | 'postalCode' | 'source' | 'createdAt'
>;

export type ContactPrimaryPersonFragment = { __typename?: 'Person' } & Pick<
  Types.Person,
  'firstName' | 'lastName'
> & {
    primaryEmailAddress?: Types.Maybe<
      { __typename?: 'EmailAddress' } & Pick<Types.EmailAddress, 'email'>
    >;
  };

export const ContactPrimaryAddressFragmentDoc = gql`
  fragment ContactPrimaryAddress on Address {
    street
    city
    state
    postalCode
    source
    createdAt
  }
`;
export const ContactPrimaryPersonFragmentDoc = gql`
  fragment ContactPrimaryPerson on Person {
    firstName
    lastName
    primaryEmailAddress {
      email
    }
  }
`;
export const GetInvalidNewsletterDocument = gql`
  query GetInvalidNewsletter($accountListId: ID!) {
    contacts(
      accountListId: $accountListId
      contactsFilter: {
        newsletter: NO_VALUE
        status: [PARTNER_FINANCIAL, PARTNER_SPECIAL, PARTNER_PRAY]
      }
      first: 100
    ) {
      nodes {
        id
        name
        status
        source
        primaryAddress {
          ...ContactPrimaryAddress
        }
        primaryPerson {
          ...ContactPrimaryPerson
        }
      }
    }
  }
  ${ContactPrimaryAddressFragmentDoc}
  ${ContactPrimaryPersonFragmentDoc}
`;
export function useGetInvalidNewsletterQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetInvalidNewsletterQuery,
    GetInvalidNewsletterQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetInvalidNewsletterQuery,
    GetInvalidNewsletterQueryVariables
  >(GetInvalidNewsletterDocument, options);
}
export function useGetInvalidNewsletterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetInvalidNewsletterQuery,
    GetInvalidNewsletterQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetInvalidNewsletterQuery,
    GetInvalidNewsletterQueryVariables
  >(GetInvalidNewsletterDocument, options);
}
export type GetInvalidNewsletterQueryHookResult = ReturnType<
  typeof useGetInvalidNewsletterQuery
>;
export type GetInvalidNewsletterLazyQueryHookResult = ReturnType<
  typeof useGetInvalidNewsletterLazyQuery
>;
export type GetInvalidNewsletterQueryResult = Apollo.QueryResult<
  GetInvalidNewsletterQuery,
  GetInvalidNewsletterQueryVariables
>;
