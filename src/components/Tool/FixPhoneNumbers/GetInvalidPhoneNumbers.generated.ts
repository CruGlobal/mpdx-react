import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetInvalidPhoneNumbersQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetInvalidPhoneNumbersQuery = (
  { __typename?: 'Query' }
  & { people: (
    { __typename?: 'PersonConnection' }
    & { nodes: Array<(
      { __typename?: 'Person' }
      & Pick<Types.Person, 'id' | 'firstName' | 'lastName'>
      & { phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'primary' | 'number' | 'updatedAt' | 'source'>
        )> }
      ) }
    )> }
  ) }
);

export type PersonInvalidNumberFragment = (
  { __typename?: 'Person' }
  & Pick<Types.Person, 'id' | 'firstName' | 'lastName'>
  & { phoneNumbers: (
    { __typename?: 'PhoneNumberConnection' }
    & { nodes: Array<(
      { __typename?: 'PhoneNumber' }
      & Pick<Types.PhoneNumber, 'id' | 'primary' | 'number' | 'updatedAt' | 'source'>
    )> }
  ) }
);

export type PersonPhoneNumberFragment = (
  { __typename?: 'PhoneNumber' }
  & Pick<Types.PhoneNumber, 'id' | 'primary' | 'number' | 'updatedAt' | 'source'>
);

export const PersonPhoneNumberFragmentDoc = gql`
    fragment PersonPhoneNumber on PhoneNumber {
  id
  primary
  number
  updatedAt
  source
}
    `;
export const PersonInvalidNumberFragmentDoc = gql`
    fragment PersonInvalidNumber on Person {
  id
  firstName
  lastName
  phoneNumbers(first: 25) {
    nodes {
      ...PersonPhoneNumber
    }
  }
}
    ${PersonPhoneNumberFragmentDoc}`;
export const GetInvalidPhoneNumbersDocument = gql`
    query GetInvalidPhoneNumbers($accountListId: ID!) {
  people(
    accountListId: $accountListId
    peopleFilter: {phoneNumberValid: false}
    first: 50
  ) {
    nodes {
      ...PersonInvalidNumber
    }
  }
}
    ${PersonInvalidNumberFragmentDoc}`;
export function useGetInvalidPhoneNumbersQuery(baseOptions: Apollo.QueryHookOptions<GetInvalidPhoneNumbersQuery, GetInvalidPhoneNumbersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInvalidPhoneNumbersQuery, GetInvalidPhoneNumbersQueryVariables>(GetInvalidPhoneNumbersDocument, options);
      }
export function useGetInvalidPhoneNumbersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInvalidPhoneNumbersQuery, GetInvalidPhoneNumbersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInvalidPhoneNumbersQuery, GetInvalidPhoneNumbersQueryVariables>(GetInvalidPhoneNumbersDocument, options);
        }
export type GetInvalidPhoneNumbersQueryHookResult = ReturnType<typeof useGetInvalidPhoneNumbersQuery>;
export type GetInvalidPhoneNumbersLazyQueryHookResult = ReturnType<typeof useGetInvalidPhoneNumbersLazyQuery>;
export type GetInvalidPhoneNumbersQueryResult = Apollo.QueryResult<GetInvalidPhoneNumbersQuery, GetInvalidPhoneNumbersQueryVariables>;