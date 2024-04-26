import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetPersonalPreferencesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetPersonalPreferencesQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<
    Types.User,
    'id' | 'defaultAccountList'
  > & {
      preferences?: Types.Maybe<
        { __typename?: 'Preference' } & Pick<
          Types.Preference,
          | 'id'
          | 'timeZone'
          | 'localeDisplay'
          | 'locale'
          | 'hourToSendNotifications'
        >
      >;
    };
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'name'
  >;
  accountLists: { __typename?: 'AccountListConnection' } & {
    nodes: Array<
      { __typename?: 'AccountList' } & Pick<Types.AccountList, 'name' | 'id'>
    >;
  };
};

export const GetPersonalPreferencesDocument = gql`
  query GetPersonalPreferences($accountListId: ID!) {
    user {
      id
      defaultAccountList
      preferences {
        id
        timeZone
        localeDisplay
        locale
        hourToSendNotifications
      }
    }
    accountList(id: $accountListId) {
      id
      name
    }
    accountLists {
      nodes {
        name
        id
      }
    }
  }
`;
export function useGetPersonalPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPersonalPreferencesQuery,
    GetPersonalPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPersonalPreferencesQuery,
    GetPersonalPreferencesQueryVariables
  >(GetPersonalPreferencesDocument, options);
}
export function useGetPersonalPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPersonalPreferencesQuery,
    GetPersonalPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPersonalPreferencesQuery,
    GetPersonalPreferencesQueryVariables
  >(GetPersonalPreferencesDocument, options);
}
export type GetPersonalPreferencesQueryHookResult = ReturnType<
  typeof useGetPersonalPreferencesQuery
>;
export type GetPersonalPreferencesLazyQueryHookResult = ReturnType<
  typeof useGetPersonalPreferencesLazyQuery
>;
export type GetPersonalPreferencesQueryResult = Apollo.QueryResult<
  GetPersonalPreferencesQuery,
  GetPersonalPreferencesQueryVariables
>;
