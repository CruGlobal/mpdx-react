import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LoadCoachingNeedsQueryVariables = Types.Exact<{
  coachingAccountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type LoadCoachingNeedsQuery = (
  { __typename?: 'Query' }
  & { coachingAccountList: (
    { __typename?: 'CoachingAccountList' }
    & Pick<Types.CoachingAccountList, 'id'>
    & { primaryAppeal?: Types.Maybe<(
      { __typename?: 'CoachingAppeal' }
      & Pick<Types.CoachingAppeal, 'id'>
      & { pledges: (
        { __typename?: 'CoachingPledgeConnection' }
        & { nodes: Array<(
          { __typename?: 'CoachingPledge' }
          & Pick<Types.CoachingPledge, 'id' | 'amount' | 'amountCurrency' | 'expectedDate'>
          & { contact: (
            { __typename?: 'CoachingContact' }
            & Pick<Types.CoachingContact, 'id' | 'name'>
          ) }
        )>, pageInfo: (
          { __typename?: 'PageInfo' }
          & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
        ) }
      ) }
    )> }
  ) }
);

export type LoadAccountListCoachingNeedsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type LoadAccountListCoachingNeedsQuery = (
  { __typename?: 'Query' }
  & { accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id'>
    & { primaryAppeal?: Types.Maybe<(
      { __typename?: 'Appeal' }
      & Pick<Types.Appeal, 'id'>
      & { pledges: (
        { __typename?: 'PledgeConnection' }
        & { nodes: Array<(
          { __typename?: 'Pledge' }
          & Pick<Types.Pledge, 'id' | 'amount' | 'amountCurrency' | 'expectedDate'>
          & { contact: (
            { __typename?: 'Contact' }
            & Pick<Types.Contact, 'id' | 'name'>
          ) }
        )>, pageInfo: (
          { __typename?: 'PageInfo' }
          & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
        ) }
      ) }
    )> }
  ) }
);


export const LoadCoachingNeedsDocument = gql`
    query LoadCoachingNeeds($coachingAccountListId: ID!, $after: String) {
  coachingAccountList(id: $coachingAccountListId) {
    id
    primaryAppeal {
      id
      pledges(first: 8, after: $after) {
        nodes {
          id
          amount
          amountCurrency
          expectedDate
          contact {
            id
            name
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
}
    `;
export function useLoadCoachingNeedsQuery(baseOptions: Apollo.QueryHookOptions<LoadCoachingNeedsQuery, LoadCoachingNeedsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoadCoachingNeedsQuery, LoadCoachingNeedsQueryVariables>(LoadCoachingNeedsDocument, options);
      }
export function useLoadCoachingNeedsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoadCoachingNeedsQuery, LoadCoachingNeedsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoadCoachingNeedsQuery, LoadCoachingNeedsQueryVariables>(LoadCoachingNeedsDocument, options);
        }
export type LoadCoachingNeedsQueryHookResult = ReturnType<typeof useLoadCoachingNeedsQuery>;
export type LoadCoachingNeedsLazyQueryHookResult = ReturnType<typeof useLoadCoachingNeedsLazyQuery>;
export type LoadCoachingNeedsQueryResult = Apollo.QueryResult<LoadCoachingNeedsQuery, LoadCoachingNeedsQueryVariables>;
export const LoadAccountListCoachingNeedsDocument = gql`
    query LoadAccountListCoachingNeeds($accountListId: ID!, $after: String) {
  accountList(id: $accountListId) {
    id
    primaryAppeal {
      id
      pledges(first: 8, after: $after) {
        nodes {
          id
          amount
          amountCurrency
          expectedDate
          contact {
            id
            name
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
}
    `;
export function useLoadAccountListCoachingNeedsQuery(baseOptions: Apollo.QueryHookOptions<LoadAccountListCoachingNeedsQuery, LoadAccountListCoachingNeedsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoadAccountListCoachingNeedsQuery, LoadAccountListCoachingNeedsQueryVariables>(LoadAccountListCoachingNeedsDocument, options);
      }
export function useLoadAccountListCoachingNeedsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoadAccountListCoachingNeedsQuery, LoadAccountListCoachingNeedsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoadAccountListCoachingNeedsQuery, LoadAccountListCoachingNeedsQueryVariables>(LoadAccountListCoachingNeedsDocument, options);
        }
export type LoadAccountListCoachingNeedsQueryHookResult = ReturnType<typeof useLoadAccountListCoachingNeedsQuery>;
export type LoadAccountListCoachingNeedsLazyQueryHookResult = ReturnType<typeof useLoadAccountListCoachingNeedsLazyQuery>;
export type LoadAccountListCoachingNeedsQueryResult = Apollo.QueryResult<LoadAccountListCoachingNeedsQuery, LoadAccountListCoachingNeedsQueryVariables>;