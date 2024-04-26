import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type AccountListFragment = { __typename?: 'AccountList' } & Pick<
  Types.AccountList,
  | 'id'
  | 'name'
  | 'activeMpdMonthlyGoal'
  | 'activeMpdFinishAt'
  | 'activeMpdStartAt'
  | 'salaryOrganizationId'
> & {
    settings?: Types.Maybe<
      { __typename?: 'AccountListSettings' } & Pick<
        Types.AccountListSettings,
        'currency' | 'homeCountry' | 'monthlyGoal' | 'tester'
      >
    >;
  };

export type GetAccountPreferencesQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type GetAccountPreferencesQuery = { __typename?: 'Query' } & {
  user: { __typename?: 'User' } & Pick<Types.User, 'id'>;
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    | 'id'
    | 'name'
    | 'activeMpdMonthlyGoal'
    | 'activeMpdFinishAt'
    | 'activeMpdStartAt'
    | 'salaryOrganizationId'
  > & {
      settings?: Types.Maybe<
        { __typename?: 'AccountListSettings' } & Pick<
          Types.AccountListSettings,
          'currency' | 'homeCountry' | 'monthlyGoal' | 'tester'
        >
      >;
    };
  accountLists: { __typename?: 'AccountListConnection' } & {
    nodes: Array<
      { __typename?: 'AccountList' } & Pick<Types.AccountList, 'name' | 'id'>
    >;
  };
};

export type CanUserExportDataQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type CanUserExportDataQuery = { __typename?: 'Query' } & {
  canUserExportData: { __typename?: 'CanUserExportData' } & Pick<
    Types.CanUserExportData,
    'allowed' | 'exportedAt'
  >;
};

export type ExportDataMutationVariables = Types.Exact<{
  input: Types.ExportDataInput;
}>;

export type ExportDataMutation = { __typename?: 'Mutation' } & Pick<
  Types.Mutation,
  'exportData'
>;

export const AccountListFragmentDoc = gql`
  fragment AccountList on AccountList {
    id
    name
    activeMpdMonthlyGoal
    activeMpdFinishAt
    activeMpdStartAt
    salaryOrganizationId
    settings {
      currency
      homeCountry
      monthlyGoal
      tester
    }
  }
`;
export const GetAccountPreferencesDocument = gql`
  query GetAccountPreferences($accountListId: ID!) {
    user {
      id
    }
    accountList(id: $accountListId) {
      ...AccountList
    }
    accountLists {
      nodes {
        name
        id
      }
    }
  }
  ${AccountListFragmentDoc}
`;
export function useGetAccountPreferencesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetAccountPreferencesQuery,
    GetAccountPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetAccountPreferencesQuery,
    GetAccountPreferencesQueryVariables
  >(GetAccountPreferencesDocument, options);
}
export function useGetAccountPreferencesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetAccountPreferencesQuery,
    GetAccountPreferencesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetAccountPreferencesQuery,
    GetAccountPreferencesQueryVariables
  >(GetAccountPreferencesDocument, options);
}
export type GetAccountPreferencesQueryHookResult = ReturnType<
  typeof useGetAccountPreferencesQuery
>;
export type GetAccountPreferencesLazyQueryHookResult = ReturnType<
  typeof useGetAccountPreferencesLazyQuery
>;
export type GetAccountPreferencesQueryResult = Apollo.QueryResult<
  GetAccountPreferencesQuery,
  GetAccountPreferencesQueryVariables
>;
export const CanUserExportDataDocument = gql`
  query CanUserExportData($accountListId: ID!) {
    canUserExportData(accountListId: $accountListId) {
      allowed
      exportedAt
    }
  }
`;
export function useCanUserExportDataQuery(
  baseOptions: Apollo.QueryHookOptions<
    CanUserExportDataQuery,
    CanUserExportDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CanUserExportDataQuery,
    CanUserExportDataQueryVariables
  >(CanUserExportDataDocument, options);
}
export function useCanUserExportDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CanUserExportDataQuery,
    CanUserExportDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CanUserExportDataQuery,
    CanUserExportDataQueryVariables
  >(CanUserExportDataDocument, options);
}
export type CanUserExportDataQueryHookResult = ReturnType<
  typeof useCanUserExportDataQuery
>;
export type CanUserExportDataLazyQueryHookResult = ReturnType<
  typeof useCanUserExportDataLazyQuery
>;
export type CanUserExportDataQueryResult = Apollo.QueryResult<
  CanUserExportDataQuery,
  CanUserExportDataQueryVariables
>;
export const ExportDataDocument = gql`
  mutation ExportData($input: ExportDataInput!) {
    exportData(input: $input)
  }
`;
export type ExportDataMutationFn = Apollo.MutationFunction<
  ExportDataMutation,
  ExportDataMutationVariables
>;
export function useExportDataMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ExportDataMutation,
    ExportDataMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ExportDataMutation, ExportDataMutationVariables>(
    ExportDataDocument,
    options,
  );
}
export type ExportDataMutationHookResult = ReturnType<
  typeof useExportDataMutation
>;
export type ExportDataMutationResult =
  Apollo.MutationResult<ExportDataMutation>;
export type ExportDataMutationOptions = Apollo.BaseMutationOptions<
  ExportDataMutation,
  ExportDataMutationVariables
>;
