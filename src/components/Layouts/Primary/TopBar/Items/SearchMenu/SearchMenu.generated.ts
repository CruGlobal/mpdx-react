import * as Types from '../../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSearchMenuContactsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactsFilter?: Types.InputMaybe<Types.ContactFilterSetInput>;
}>;

export type GetSearchMenuContactsQuery = { __typename?: 'Query' } & {
  contacts: { __typename?: 'ContactConnection' } & Pick<
    Types.ContactConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Contact' } & Pick<
          Types.Contact,
          'id' | 'name' | 'status'
        >
      >;
    };
};

export const GetSearchMenuContactsDocument = gql`
  query GetSearchMenuContacts(
    $accountListId: ID!
    $contactsFilter: ContactFilterSetInput
  ) {
    contacts(
      accountListId: $accountListId
      contactsFilter: $contactsFilter
      first: 5
    ) {
      nodes {
        id
        name
        status
      }
      totalCount
    }
  }
`;
export function useGetSearchMenuContactsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSearchMenuContactsQuery,
    GetSearchMenuContactsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSearchMenuContactsQuery,
    GetSearchMenuContactsQueryVariables
  >(GetSearchMenuContactsDocument, options);
}
export function useGetSearchMenuContactsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSearchMenuContactsQuery,
    GetSearchMenuContactsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSearchMenuContactsQuery,
    GetSearchMenuContactsQueryVariables
  >(GetSearchMenuContactsDocument, options);
}
export type GetSearchMenuContactsQueryHookResult = ReturnType<
  typeof useGetSearchMenuContactsQuery
>;
export type GetSearchMenuContactsLazyQueryHookResult = ReturnType<
  typeof useGetSearchMenuContactsLazyQuery
>;
export type GetSearchMenuContactsQueryResult = Apollo.QueryResult<
  GetSearchMenuContactsQuery,
  GetSearchMenuContactsQueryVariables
>;
