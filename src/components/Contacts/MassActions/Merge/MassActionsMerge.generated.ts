import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type MassActionsMergeMutationVariables = Types.Exact<{
  loserContactIds:
    | Array<Types.Scalars['ID']['input']>
    | Types.Scalars['ID']['input'];
  winnerContactId: Types.Scalars['ID']['input'];
}>;

export type MassActionsMergeMutation = { __typename?: 'Mutation' } & Pick<
  Types.Mutation,
  'mergeContacts'
>;

export type GetContactsForMergingQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactIds:
    | Array<Types.Scalars['ID']['input']>
    | Types.Scalars['ID']['input'];
  numContactIds: Types.Scalars['Int']['input'];
}>;

export type GetContactsForMergingQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'avatar' | 'name' | 'createdAt' | 'status'
      > & {
          primaryAddress?: Types.Maybe<
            { __typename?: 'Address' } & Pick<
              Types.Address,
              'id' | 'street' | 'city' | 'state' | 'postalCode' | 'source'
            >
          >;
        }
    >;
  };
};

export const MassActionsMergeDocument = gql`
  mutation MassActionsMerge($loserContactIds: [ID!]!, $winnerContactId: ID!) {
    mergeContacts(
      input: {
        loserContactIds: $loserContactIds
        winnerContactId: $winnerContactId
      }
    )
  }
`;
export type MassActionsMergeMutationFn = Apollo.MutationFunction<
  MassActionsMergeMutation,
  MassActionsMergeMutationVariables
>;
export function useMassActionsMergeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MassActionsMergeMutation,
    MassActionsMergeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MassActionsMergeMutation,
    MassActionsMergeMutationVariables
  >(MassActionsMergeDocument, options);
}
export type MassActionsMergeMutationHookResult = ReturnType<
  typeof useMassActionsMergeMutation
>;
export type MassActionsMergeMutationResult =
  Apollo.MutationResult<MassActionsMergeMutation>;
export type MassActionsMergeMutationOptions = Apollo.BaseMutationOptions<
  MassActionsMergeMutation,
  MassActionsMergeMutationVariables
>;
export const GetContactsForMergingDocument = gql`
  query GetContactsForMerging(
    $accountListId: ID!
    $contactIds: [ID!]!
    $numContactIds: Int!
  ) {
    contacts(
      accountListId: $accountListId
      contactsFilter: { ids: $contactIds }
      first: $numContactIds
    ) {
      nodes {
        id
        avatar
        name
        primaryAddress {
          id
          street
          city
          state
          postalCode
          source
        }
        createdAt
        status
      }
    }
  }
`;
export function useGetContactsForMergingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContactsForMergingQuery,
    GetContactsForMergingQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetContactsForMergingQuery,
    GetContactsForMergingQueryVariables
  >(GetContactsForMergingDocument, options);
}
export function useGetContactsForMergingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContactsForMergingQuery,
    GetContactsForMergingQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetContactsForMergingQuery,
    GetContactsForMergingQueryVariables
  >(GetContactsForMergingDocument, options);
}
export type GetContactsForMergingQueryHookResult = ReturnType<
  typeof useGetContactsForMergingQuery
>;
export type GetContactsForMergingLazyQueryHookResult = ReturnType<
  typeof useGetContactsForMergingLazyQuery
>;
export type GetContactsForMergingQueryResult = Apollo.QueryResult<
  GetContactsForMergingQuery,
  GetContactsForMergingQueryVariables
>;
