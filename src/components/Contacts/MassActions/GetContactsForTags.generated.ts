import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetContactsForTagsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactIds:
    | Array<Types.Scalars['ID']['input']>
    | Types.Scalars['ID']['input'];
  numContactIds: Types.Scalars['Int']['input'];
}>;

export type GetContactsForTagsQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & {
    nodes: Array<
      { __typename?: 'Contact' } & Pick<Types.Contact, 'id' | 'tagList'>
    >;
  };
};

export const GetContactsForTagsDocument = gql`
  query GetContactsForTags(
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
        tagList
      }
    }
  }
`;
export function useGetContactsForTagsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetContactsForTagsQuery,
    GetContactsForTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetContactsForTagsQuery,
    GetContactsForTagsQueryVariables
  >(GetContactsForTagsDocument, options);
}
export function useGetContactsForTagsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetContactsForTagsQuery,
    GetContactsForTagsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetContactsForTagsQuery,
    GetContactsForTagsQueryVariables
  >(GetContactsForTagsDocument, options);
}
export type GetContactsForTagsQueryHookResult = ReturnType<
  typeof useGetContactsForTagsQuery
>;
export type GetContactsForTagsLazyQueryHookResult = ReturnType<
  typeof useGetContactsForTagsLazyQuery
>;
export type GetContactsForTagsQueryResult = Apollo.QueryResult<
  GetContactsForTagsQuery,
  GetContactsForTagsQueryVariables
>;
