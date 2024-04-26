import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AssigneeOptionsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type AssigneeOptionsQuery = { __typename?: 'Query' } & {
  accountListUsers: { __typename?: 'AccountListUserConnection' } & {
    nodes: Array<
      { __typename?: 'AccountListUser' } & {
        user: { __typename?: 'UserScopedToAccountList' } & Pick<
          Types.UserScopedToAccountList,
          'id' | 'firstName' | 'lastName'
        >;
      }
    >;
  };
};

export type ChurchOptionsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type ChurchOptionsQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'churches'
  >;
};

export type UpdateContactOtherMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  attributes: Types.ContactUpdateInput;
}>;

export type UpdateContactOtherMutation = { __typename?: 'Mutation' } & {
  updateContact?: Types.Maybe<
    { __typename?: 'ContactUpdateMutationPayload' } & {
      contact: { __typename?: 'Contact' } & Pick<
        Types.Contact,
        | 'id'
        | 'churchName'
        | 'locale'
        | 'preferredContactMethod'
        | 'timezone'
        | 'website'
      > & {
          user?: Types.Maybe<
            { __typename?: 'UserScopedToAccountList' } & Pick<
              Types.UserScopedToAccountList,
              'id' | 'firstName' | 'lastName'
            >
          >;
          contactReferralsToMe: { __typename?: 'ReferralConnection' } & {
            nodes: Array<
              { __typename?: 'Referral' } & Pick<Types.Referral, 'id'> & {
                  referredBy: { __typename?: 'Contact' } & Pick<
                    Types.Contact,
                    'id' | 'name'
                  >;
                }
            >;
          };
        };
    }
  >;
};

export const AssigneeOptionsDocument = gql`
  query AssigneeOptions($accountListId: ID!) {
    accountListUsers(accountListId: $accountListId, first: 25) {
      nodes {
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
export function useAssigneeOptionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    AssigneeOptionsQuery,
    AssigneeOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AssigneeOptionsQuery, AssigneeOptionsQueryVariables>(
    AssigneeOptionsDocument,
    options,
  );
}
export function useAssigneeOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AssigneeOptionsQuery,
    AssigneeOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AssigneeOptionsQuery,
    AssigneeOptionsQueryVariables
  >(AssigneeOptionsDocument, options);
}
export type AssigneeOptionsQueryHookResult = ReturnType<
  typeof useAssigneeOptionsQuery
>;
export type AssigneeOptionsLazyQueryHookResult = ReturnType<
  typeof useAssigneeOptionsLazyQuery
>;
export type AssigneeOptionsQueryResult = Apollo.QueryResult<
  AssigneeOptionsQuery,
  AssigneeOptionsQueryVariables
>;
export const ChurchOptionsDocument = gql`
  query ChurchOptions($accountListId: ID!, $search: String) {
    accountList(id: $accountListId) {
      churches(search: $search)
    }
  }
`;
export function useChurchOptionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChurchOptionsQuery,
    ChurchOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChurchOptionsQuery, ChurchOptionsQueryVariables>(
    ChurchOptionsDocument,
    options,
  );
}
export function useChurchOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChurchOptionsQuery,
    ChurchOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChurchOptionsQuery, ChurchOptionsQueryVariables>(
    ChurchOptionsDocument,
    options,
  );
}
export type ChurchOptionsQueryHookResult = ReturnType<
  typeof useChurchOptionsQuery
>;
export type ChurchOptionsLazyQueryHookResult = ReturnType<
  typeof useChurchOptionsLazyQuery
>;
export type ChurchOptionsQueryResult = Apollo.QueryResult<
  ChurchOptionsQuery,
  ChurchOptionsQueryVariables
>;
export const UpdateContactOtherDocument = gql`
  mutation UpdateContactOther(
    $accountListId: ID!
    $attributes: ContactUpdateInput!
  ) {
    updateContact(
      input: { accountListId: $accountListId, attributes: $attributes }
    ) {
      contact {
        id
        user {
          id
          firstName
          lastName
        }
        churchName
        locale
        preferredContactMethod
        timezone
        website
        contactReferralsToMe(first: 10) {
          nodes {
            id
            referredBy {
              id
              name
            }
          }
        }
      }
    }
  }
`;
export type UpdateContactOtherMutationFn = Apollo.MutationFunction<
  UpdateContactOtherMutation,
  UpdateContactOtherMutationVariables
>;
export function useUpdateContactOtherMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateContactOtherMutation,
    UpdateContactOtherMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateContactOtherMutation,
    UpdateContactOtherMutationVariables
  >(UpdateContactOtherDocument, options);
}
export type UpdateContactOtherMutationHookResult = ReturnType<
  typeof useUpdateContactOtherMutation
>;
export type UpdateContactOtherMutationResult =
  Apollo.MutationResult<UpdateContactOtherMutation>;
export type UpdateContactOtherMutationOptions = Apollo.BaseMutationOptions<
  UpdateContactOtherMutation,
  UpdateContactOtherMutationVariables
>;
