import * as Types from '../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type LoadCoachingListQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type LoadCoachingListQuery = (
  { __typename?: 'Query' }
  & { coachingAccountLists: (
    { __typename?: 'CoachingAccountListConnection' }
    & Pick<Types.CoachingAccountListConnection, 'totalCount' | 'totalPageCount'>
    & { nodes: Array<(
      { __typename?: 'CoachingAccountList' }
      & Pick<Types.CoachingAccountList, 'id' | 'name' | 'currency' | 'monthlyGoal' | 'balance' | 'receivedPledges' | 'totalPledges'>
      & { primaryAppeal?: Types.Maybe<(
        { __typename?: 'CoachingAppeal' }
        & Pick<Types.CoachingAppeal, 'active' | 'amount' | 'amountCurrency' | 'id' | 'name' | 'pledgesAmountNotReceivedNotProcessed' | 'pledgesAmountProcessed' | 'pledgesAmountTotal'>
      )> }
    )>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<Types.PageInfo, 'startCursor' | 'endCursor' | 'hasNextPage' | 'hasPreviousPage'>
    ) }
  ) }
);

export type CoachedPersonFragment = (
  { __typename?: 'CoachingAccountList' }
  & Pick<Types.CoachingAccountList, 'id' | 'name' | 'currency' | 'monthlyGoal' | 'balance' | 'receivedPledges' | 'totalPledges'>
  & { primaryAppeal?: Types.Maybe<(
    { __typename?: 'CoachingAppeal' }
    & Pick<Types.CoachingAppeal, 'active' | 'amount' | 'amountCurrency' | 'id' | 'name' | 'pledgesAmountNotReceivedNotProcessed' | 'pledgesAmountProcessed' | 'pledgesAmountTotal'>
  )> }
);

export const CoachedPersonFragmentDoc = gql`
    fragment CoachedPerson on CoachingAccountList {
  id
  name
  primaryAppeal {
    active
    amount
    amountCurrency
    id
    name
    pledgesAmountNotReceivedNotProcessed
    pledgesAmountProcessed
    pledgesAmountTotal
  }
  currency
  monthlyGoal
  balance
  receivedPledges
  totalPledges
}
    `;
export const LoadCoachingListDocument = gql`
    query LoadCoachingList {
  coachingAccountLists(first: 25) {
    nodes {
      ...CoachedPerson
    }
    totalCount
    totalPageCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
    ${CoachedPersonFragmentDoc}`;
export function useLoadCoachingListQuery(baseOptions?: Apollo.QueryHookOptions<LoadCoachingListQuery, LoadCoachingListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoadCoachingListQuery, LoadCoachingListQueryVariables>(LoadCoachingListDocument, options);
      }
export function useLoadCoachingListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoadCoachingListQuery, LoadCoachingListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoadCoachingListQuery, LoadCoachingListQueryVariables>(LoadCoachingListDocument, options);
        }
export type LoadCoachingListQueryHookResult = ReturnType<typeof useLoadCoachingListQuery>;
export type LoadCoachingListLazyQueryHookResult = ReturnType<typeof useLoadCoachingListLazyQuery>;
export type LoadCoachingListQueryResult = Apollo.QueryResult<LoadCoachingListQuery, LoadCoachingListQueryVariables>;