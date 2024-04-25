import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetContactTagsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetContactTagsQuery = (
  { __typename?: 'Query' }
  & { accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id' | 'name' | 'contactTagList'>
  ) }
);


export const GetContactTagsDocument = gql`
    query GetContactTags($accountListId: ID!) {
  accountList(id: $accountListId) {
    id
    name
    contactTagList
  }
}
    `;
export function useGetContactTagsQuery(baseOptions: Apollo.QueryHookOptions<GetContactTagsQuery, GetContactTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContactTagsQuery, GetContactTagsQueryVariables>(GetContactTagsDocument, options);
      }
export function useGetContactTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContactTagsQuery, GetContactTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContactTagsQuery, GetContactTagsQueryVariables>(GetContactTagsDocument, options);
        }
export type GetContactTagsQueryHookResult = ReturnType<typeof useGetContactTagsQuery>;
export type GetContactTagsLazyQueryHookResult = ReturnType<typeof useGetContactTagsLazyQuery>;
export type GetContactTagsQueryResult = Apollo.QueryResult<GetContactTagsQuery, GetContactTagsQueryVariables>;