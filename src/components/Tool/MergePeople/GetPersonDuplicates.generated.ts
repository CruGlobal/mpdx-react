import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetPersonDuplicatesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetPersonDuplicatesQuery = { __typename?: 'Query' } & {
  personDuplicates: { __typename?: 'PersonDuplicateConnection' } & {
    nodes: Array<
      { __typename?: 'PersonDuplicate' } & Pick<
        Types.PersonDuplicate,
        'id' | 'reason'
      > & {
          recordOne: { __typename?: 'Person' } & Pick<
            Types.Person,
            'id' | 'firstName' | 'lastName' | 'createdAt'
          > & {
              primaryPhoneNumber?: Types.Maybe<
                { __typename?: 'PhoneNumber' } & Pick<
                  Types.PhoneNumber,
                  'number'
                >
              >;
              primaryEmailAddress?: Types.Maybe<
                { __typename?: 'EmailAddress' } & Pick<
                  Types.EmailAddress,
                  'email'
                >
              >;
            };
          recordTwo: { __typename?: 'Person' } & Pick<
            Types.Person,
            'id' | 'firstName' | 'lastName' | 'createdAt'
          > & {
              primaryPhoneNumber?: Types.Maybe<
                { __typename?: 'PhoneNumber' } & Pick<
                  Types.PhoneNumber,
                  'number'
                >
              >;
              primaryEmailAddress?: Types.Maybe<
                { __typename?: 'EmailAddress' } & Pick<
                  Types.EmailAddress,
                  'email'
                >
              >;
            };
        }
    >;
  };
};

export type BasicEmailInfoFragment = { __typename?: 'EmailAddress' } & Pick<
  Types.EmailAddress,
  'email'
>;

export type BasicPhoneNumberInfoFragment = {
  __typename?: 'PhoneNumber';
} & Pick<Types.PhoneNumber, 'number'>;

export type PersonInfoFragment = { __typename?: 'Person' } & Pick<
  Types.Person,
  'id' | 'firstName' | 'lastName' | 'createdAt'
> & {
    primaryPhoneNumber?: Types.Maybe<
      { __typename?: 'PhoneNumber' } & Pick<Types.PhoneNumber, 'number'>
    >;
    primaryEmailAddress?: Types.Maybe<
      { __typename?: 'EmailAddress' } & Pick<Types.EmailAddress, 'email'>
    >;
  };

export const BasicPhoneNumberInfoFragmentDoc = gql`
  fragment BasicPhoneNumberInfo on PhoneNumber {
    number
  }
`;
export const BasicEmailInfoFragmentDoc = gql`
  fragment BasicEmailInfo on EmailAddress {
    email
  }
`;
export const PersonInfoFragmentDoc = gql`
  fragment PersonInfo on Person {
    id
    firstName
    lastName
    createdAt
    primaryPhoneNumber {
      ...BasicPhoneNumberInfo
    }
    primaryEmailAddress {
      ...BasicEmailInfo
    }
  }
  ${BasicPhoneNumberInfoFragmentDoc}
  ${BasicEmailInfoFragmentDoc}
`;
export const GetPersonDuplicatesDocument = gql`
  query GetPersonDuplicates($accountListId: ID!) {
    personDuplicates(accountListId: $accountListId, first: 50) {
      nodes {
        id
        reason
        recordOne {
          ...PersonInfo
        }
        recordTwo {
          ...PersonInfo
        }
      }
    }
  }
  ${PersonInfoFragmentDoc}
`;
export function useGetPersonDuplicatesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPersonDuplicatesQuery,
    GetPersonDuplicatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPersonDuplicatesQuery,
    GetPersonDuplicatesQueryVariables
  >(GetPersonDuplicatesDocument, options);
}
export function useGetPersonDuplicatesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPersonDuplicatesQuery,
    GetPersonDuplicatesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPersonDuplicatesQuery,
    GetPersonDuplicatesQueryVariables
  >(GetPersonDuplicatesDocument, options);
}
export type GetPersonDuplicatesQueryHookResult = ReturnType<
  typeof useGetPersonDuplicatesQuery
>;
export type GetPersonDuplicatesLazyQueryHookResult = ReturnType<
  typeof useGetPersonDuplicatesLazyQuery
>;
export type GetPersonDuplicatesQueryResult = Apollo.QueryResult<
  GetPersonDuplicatesQuery,
  GetPersonDuplicatesQueryVariables
>;
