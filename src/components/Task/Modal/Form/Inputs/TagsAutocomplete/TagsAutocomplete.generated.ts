import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type TagOptionsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contact: Types.Scalars['Boolean']['input'];
}>;

export type TagOptionsQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Types.MakeOptional<
    Pick<Types.AccountList, 'id' | 'contactTagList' | 'taskTagList'>,
    'contactTagList' | 'taskTagList'
  >;
};

export const TagOptionsDocument = gql`
  query TagOptions($accountListId: ID!, $contact: Boolean!) {
    accountList(id: $accountListId) {
      id
      contactTagList @include(if: $contact)
      taskTagList @skip(if: $contact)
    }
  }
`;
export function useTagOptionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    TagOptionsQuery,
    TagOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<TagOptionsQuery, TagOptionsQueryVariables>(
    TagOptionsDocument,
    options,
  );
}
export function useTagOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    TagOptionsQuery,
    TagOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<TagOptionsQuery, TagOptionsQueryVariables>(
    TagOptionsDocument,
    options,
  );
}
export type TagOptionsQueryHookResult = ReturnType<typeof useTagOptionsQuery>;
export type TagOptionsLazyQueryHookResult = ReturnType<
  typeof useTagOptionsLazyQuery
>;
export type TagOptionsQueryResult = Apollo.QueryResult<
  TagOptionsQuery,
  TagOptionsQueryVariables
>;
