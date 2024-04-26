import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type UpdateContactTagsMutationVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
  tagList:
    | Array<Types.Scalars['String']['input']>
    | Types.Scalars['String']['input'];
}>;

export type UpdateContactTagsMutation = { __typename?: 'Mutation' } & {
  updateContact?: Types.Maybe<
    { __typename?: 'ContactUpdateMutationPayload' } & {
      contact: { __typename?: 'Contact' } & Pick<
        Types.Contact,
        'id' | 'tagList'
      >;
    }
  >;
};

export type GetContactTagListQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetContactTagListQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'contactTagList'
  >;
};

export const UpdateContactTagsDocument = gql`
  mutation UpdateContactTags(
    $accountListId: ID!
    $contactId: ID!
    $tagList: [String!]!
  ) {
    updateContact(
      input: {
        accountListId: $accountListId
        attributes: { id: $contactId, tagList: $tagList }
      }
    ) {
      contact {
        id
        tagList
      }
    }
  }
`;
export type UpdateContactTagsMutationFn = Apollo.MutationFunction<
  UpdateContactTagsMutation,
  UpdateContactTagsMutationVariables
>;
export function useUpdateContactTagsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateContactTagsMutation,
    UpdateContactTagsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateContactTagsMutation,
    UpdateContactTagsMutationVariables
  >(UpdateContactTagsDocument, options);
}
export type UpdateContactTagsMutationHookResult = ReturnType<
  typeof useUpdateContactTagsMutation
>;
export type UpdateContactTagsMutationResult =
  Apollo.MutationResult<UpdateContactTagsMutation>;
export type UpdateContactTagsMutationOptions = Apollo.BaseMutationOptions<
  UpdateContactTagsMutation,
  UpdateContactTagsMutationVariables
>;
export const GetContactTagListDocument = gql`
  query GetContactTagList($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      contactTagList
    }
  }
`;
export function useGetContactTagListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContactTagListQuery,
    GetContactTagListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetContactTagListQuery,
    GetContactTagListQueryVariables
  >(GetContactTagListDocument, options);
}
export function useGetContactTagListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContactTagListQuery,
    GetContactTagListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetContactTagListQuery,
    GetContactTagListQueryVariables
  >(GetContactTagListDocument, options);
}
export type GetContactTagListQueryHookResult = ReturnType<
  typeof useGetContactTagListQuery
>;
export type GetContactTagListLazyQueryHookResult = ReturnType<
  typeof useGetContactTagListLazyQuery
>;
export type GetContactTagListQueryResult = Apollo.QueryResult<
  GetContactTagListQuery,
  GetContactTagListQueryVariables
>;
