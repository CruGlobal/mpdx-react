import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LoadCoachingCommitmentsQueryVariables = Types.Exact<{
  coachingAccountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type LoadCoachingCommitmentsQuery = (
  { __typename?: 'Query' }
  & { coachingAccountList: (
    { __typename?: 'CoachingAccountList' }
    & Pick<Types.CoachingAccountList, 'id'>
    & { contacts: (
      { __typename?: 'CoachingContactConnection' }
      & { nodes: Array<(
        { __typename?: 'CoachingContact' }
        & Pick<Types.CoachingContact, 'id' | 'name' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeStartDate' | 'pledgeFrequency'>
      )>, pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
      ) }
    ) }
  ) }
);

export type LoadAccountListCoachingCommitmentsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type LoadAccountListCoachingCommitmentsQuery = (
  { __typename?: 'Query' }
  & { accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id'>
    & { contacts: (
      { __typename?: 'ContactConnection' }
      & { nodes: Array<(
        { __typename?: 'Contact' }
        & Pick<Types.Contact, 'id' | 'name' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeStartDate' | 'pledgeFrequency'>
      )>, pageInfo: (
        { __typename?: 'PageInfo' }
        & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
      ) }
    ) }
  ) }
);


export const LoadCoachingCommitmentsDocument = gql`
    query LoadCoachingCommitments($coachingAccountListId: ID!, $after: String) {
  coachingAccountList(id: $coachingAccountListId) {
    id
    contacts(first: 8, after: $after, filter: {pledge: "outstanding"}) {
      nodes {
        id
        name
        pledgeAmount
        pledgeCurrency
        pledgeStartDate
        pledgeFrequency
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    `;
export function useLoadCoachingCommitmentsQuery(baseOptions: Apollo.QueryHookOptions<LoadCoachingCommitmentsQuery, LoadCoachingCommitmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoadCoachingCommitmentsQuery, LoadCoachingCommitmentsQueryVariables>(LoadCoachingCommitmentsDocument, options);
      }
export function useLoadCoachingCommitmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoadCoachingCommitmentsQuery, LoadCoachingCommitmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoadCoachingCommitmentsQuery, LoadCoachingCommitmentsQueryVariables>(LoadCoachingCommitmentsDocument, options);
        }
export type LoadCoachingCommitmentsQueryHookResult = ReturnType<typeof useLoadCoachingCommitmentsQuery>;
export type LoadCoachingCommitmentsLazyQueryHookResult = ReturnType<typeof useLoadCoachingCommitmentsLazyQuery>;
export type LoadCoachingCommitmentsQueryResult = Apollo.QueryResult<LoadCoachingCommitmentsQuery, LoadCoachingCommitmentsQueryVariables>;
export const LoadAccountListCoachingCommitmentsDocument = gql`
    query LoadAccountListCoachingCommitments($accountListId: ID!, $after: String) {
  accountList(id: $accountListId) {
    id
    contacts(first: 8, after: $after, filter: {pledge: "outstanding"}) {
      nodes {
        id
        name
        pledgeAmount
        pledgeCurrency
        pledgeStartDate
        pledgeFrequency
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    `;
export function useLoadAccountListCoachingCommitmentsQuery(baseOptions: Apollo.QueryHookOptions<LoadAccountListCoachingCommitmentsQuery, LoadAccountListCoachingCommitmentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoadAccountListCoachingCommitmentsQuery, LoadAccountListCoachingCommitmentsQueryVariables>(LoadAccountListCoachingCommitmentsDocument, options);
      }
export function useLoadAccountListCoachingCommitmentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoadAccountListCoachingCommitmentsQuery, LoadAccountListCoachingCommitmentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoadAccountListCoachingCommitmentsQuery, LoadAccountListCoachingCommitmentsQueryVariables>(LoadAccountListCoachingCommitmentsDocument, options);
        }
export type LoadAccountListCoachingCommitmentsQueryHookResult = ReturnType<typeof useLoadAccountListCoachingCommitmentsQuery>;
export type LoadAccountListCoachingCommitmentsLazyQueryHookResult = ReturnType<typeof useLoadAccountListCoachingCommitmentsLazyQuery>;
export type LoadAccountListCoachingCommitmentsQueryResult = Apollo.QueryResult<LoadAccountListCoachingCommitmentsQuery, LoadAccountListCoachingCommitmentsQueryVariables>;