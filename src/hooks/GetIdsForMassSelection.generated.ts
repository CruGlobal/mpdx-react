import * as Types from '../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetIdsForMassSelectionQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  first: Types.Scalars['Int']['input'];
  contactsFilters?: Types.InputMaybe<Types.ContactFilterSetInput>;
}>;


export type GetIdsForMassSelectionQuery = (
  { __typename?: 'Query' }
  & { contacts: (
    { __typename?: 'ContactConnection' }
    & { nodes: Array<(
      { __typename?: 'Contact' }
      & Pick<Types.Contact, 'id'>
    )> }
  ) }
);

export type GetTaskIdsForMassSelectionQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  first: Types.Scalars['Int']['input'];
  tasksFilter?: Types.InputMaybe<Types.TaskFilterSetInput>;
}>;


export type GetTaskIdsForMassSelectionQuery = (
  { __typename?: 'Query' }
  & { tasks: (
    { __typename?: 'TaskConnection' }
    & { nodes: Array<(
      { __typename?: 'Task' }
      & Pick<Types.Task, 'id'>
    )> }
  ) }
);

export type GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables = Types.Exact<{
  input: Types.PartnerGivingAnalysisReportInput;
}>;


export type GetPartnerGivingAnalysisIdsForMassSelectionQuery = (
  { __typename?: 'Query' }
  & { partnerGivingAnalysisReport: (
    { __typename?: 'PartnerGivingAnalysisReport' }
    & { contacts: Array<(
      { __typename?: 'PartnerGivingAnalysisReportContact' }
      & Pick<Types.PartnerGivingAnalysisReportContact, 'id'>
    )> }
  ) }
);


export const GetIdsForMassSelectionDocument = gql`
    query GetIdsForMassSelection($accountListId: ID!, $first: Int!, $contactsFilters: ContactFilterSetInput) {
  contacts(
    accountListId: $accountListId
    first: $first
    contactsFilter: $contactsFilters
  ) {
    nodes {
      id
    }
  }
}
    `;
export function useGetIdsForMassSelectionQuery(baseOptions: Apollo.QueryHookOptions<GetIdsForMassSelectionQuery, GetIdsForMassSelectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetIdsForMassSelectionQuery, GetIdsForMassSelectionQueryVariables>(GetIdsForMassSelectionDocument, options);
      }
export function useGetIdsForMassSelectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetIdsForMassSelectionQuery, GetIdsForMassSelectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetIdsForMassSelectionQuery, GetIdsForMassSelectionQueryVariables>(GetIdsForMassSelectionDocument, options);
        }
export type GetIdsForMassSelectionQueryHookResult = ReturnType<typeof useGetIdsForMassSelectionQuery>;
export type GetIdsForMassSelectionLazyQueryHookResult = ReturnType<typeof useGetIdsForMassSelectionLazyQuery>;
export type GetIdsForMassSelectionQueryResult = Apollo.QueryResult<GetIdsForMassSelectionQuery, GetIdsForMassSelectionQueryVariables>;
export const GetTaskIdsForMassSelectionDocument = gql`
    query GetTaskIdsForMassSelection($accountListId: ID!, $first: Int!, $tasksFilter: TaskFilterSetInput) {
  tasks(accountListId: $accountListId, first: $first, tasksFilter: $tasksFilter) {
    nodes {
      id
    }
  }
}
    `;
export function useGetTaskIdsForMassSelectionQuery(baseOptions: Apollo.QueryHookOptions<GetTaskIdsForMassSelectionQuery, GetTaskIdsForMassSelectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTaskIdsForMassSelectionQuery, GetTaskIdsForMassSelectionQueryVariables>(GetTaskIdsForMassSelectionDocument, options);
      }
export function useGetTaskIdsForMassSelectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTaskIdsForMassSelectionQuery, GetTaskIdsForMassSelectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTaskIdsForMassSelectionQuery, GetTaskIdsForMassSelectionQueryVariables>(GetTaskIdsForMassSelectionDocument, options);
        }
export type GetTaskIdsForMassSelectionQueryHookResult = ReturnType<typeof useGetTaskIdsForMassSelectionQuery>;
export type GetTaskIdsForMassSelectionLazyQueryHookResult = ReturnType<typeof useGetTaskIdsForMassSelectionLazyQuery>;
export type GetTaskIdsForMassSelectionQueryResult = Apollo.QueryResult<GetTaskIdsForMassSelectionQuery, GetTaskIdsForMassSelectionQueryVariables>;
export const GetPartnerGivingAnalysisIdsForMassSelectionDocument = gql`
    query GetPartnerGivingAnalysisIdsForMassSelection($input: PartnerGivingAnalysisReportInput!) {
  partnerGivingAnalysisReport(input: $input) {
    contacts {
      id
    }
  }
}
    `;
export function useGetPartnerGivingAnalysisIdsForMassSelectionQuery(baseOptions: Apollo.QueryHookOptions<GetPartnerGivingAnalysisIdsForMassSelectionQuery, GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPartnerGivingAnalysisIdsForMassSelectionQuery, GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables>(GetPartnerGivingAnalysisIdsForMassSelectionDocument, options);
      }
export function useGetPartnerGivingAnalysisIdsForMassSelectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPartnerGivingAnalysisIdsForMassSelectionQuery, GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPartnerGivingAnalysisIdsForMassSelectionQuery, GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables>(GetPartnerGivingAnalysisIdsForMassSelectionDocument, options);
        }
export type GetPartnerGivingAnalysisIdsForMassSelectionQueryHookResult = ReturnType<typeof useGetPartnerGivingAnalysisIdsForMassSelectionQuery>;
export type GetPartnerGivingAnalysisIdsForMassSelectionLazyQueryHookResult = ReturnType<typeof useGetPartnerGivingAnalysisIdsForMassSelectionLazyQuery>;
export type GetPartnerGivingAnalysisIdsForMassSelectionQueryResult = Apollo.QueryResult<GetPartnerGivingAnalysisIdsForMassSelectionQuery, GetPartnerGivingAnalysisIdsForMassSelectionQueryVariables>;