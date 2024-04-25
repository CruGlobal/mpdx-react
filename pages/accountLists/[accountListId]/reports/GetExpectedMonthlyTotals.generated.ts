import * as Types from '../../../../src/graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetExpectedMonthlyTotalsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  designationAccountIds?: Types.InputMaybe<Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']>;
}>;


export type GetExpectedMonthlyTotalsQuery = (
  { __typename?: 'Query' }
  & { expectedMonthlyTotalReport: (
    { __typename?: 'ExpectedMonthlyTotalReport' }
    & Pick<Types.ExpectedMonthlyTotalReport, 'currency'>
    & { received: (
      { __typename?: 'ExpectedMonthlyTotalGroup' }
      & Pick<Types.ExpectedMonthlyTotalGroup, 'total'>
      & { donations: Array<(
        { __typename?: 'ExpectedMonthlyTotalDonation' }
        & Pick<Types.ExpectedMonthlyTotalDonation, 'contactId' | 'contactName' | 'contactStatus' | 'convertedAmount' | 'convertedCurrency' | 'donationAmount' | 'donationCurrency' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency'>
      )> }
    ), likely: (
      { __typename?: 'ExpectedMonthlyTotalGroup' }
      & Pick<Types.ExpectedMonthlyTotalGroup, 'total'>
      & { donations: Array<(
        { __typename?: 'ExpectedMonthlyTotalDonation' }
        & Pick<Types.ExpectedMonthlyTotalDonation, 'contactId' | 'contactName' | 'contactStatus' | 'convertedAmount' | 'convertedCurrency' | 'donationAmount' | 'donationCurrency' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency'>
      )> }
    ), unlikely: (
      { __typename?: 'ExpectedMonthlyTotalGroup' }
      & Pick<Types.ExpectedMonthlyTotalGroup, 'total'>
      & { donations: Array<(
        { __typename?: 'ExpectedMonthlyTotalDonation' }
        & Pick<Types.ExpectedMonthlyTotalDonation, 'contactId' | 'contactName' | 'contactStatus' | 'convertedAmount' | 'convertedCurrency' | 'donationAmount' | 'donationCurrency' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency'>
      )> }
    ) }
  ) }
);

export type ExpectedDonationRowFragment = (
  { __typename?: 'ExpectedMonthlyTotalDonation' }
  & Pick<Types.ExpectedMonthlyTotalDonation, 'contactId' | 'contactName' | 'contactStatus' | 'convertedAmount' | 'convertedCurrency' | 'donationAmount' | 'donationCurrency' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency'>
);

export const ExpectedDonationRowFragmentDoc = gql`
    fragment ExpectedDonationRow on ExpectedMonthlyTotalDonation {
  contactId
  contactName
  contactStatus
  convertedAmount
  convertedCurrency
  donationAmount
  donationCurrency
  pledgeAmount
  pledgeCurrency
  pledgeFrequency
}
    `;
export const GetExpectedMonthlyTotalsDocument = gql`
    query GetExpectedMonthlyTotals($accountListId: ID!, $designationAccountIds: [ID!]) {
  expectedMonthlyTotalReport(
    accountListId: $accountListId
    designationAccountId: $designationAccountIds
  ) {
    received {
      donations {
        ...ExpectedDonationRow
      }
      total
    }
    likely {
      donations {
        ...ExpectedDonationRow
      }
      total
    }
    unlikely {
      donations {
        ...ExpectedDonationRow
      }
      total
    }
    currency
  }
}
    ${ExpectedDonationRowFragmentDoc}`;
export function useGetExpectedMonthlyTotalsQuery(baseOptions: Apollo.QueryHookOptions<GetExpectedMonthlyTotalsQuery, GetExpectedMonthlyTotalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExpectedMonthlyTotalsQuery, GetExpectedMonthlyTotalsQueryVariables>(GetExpectedMonthlyTotalsDocument, options);
      }
export function useGetExpectedMonthlyTotalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExpectedMonthlyTotalsQuery, GetExpectedMonthlyTotalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExpectedMonthlyTotalsQuery, GetExpectedMonthlyTotalsQueryVariables>(GetExpectedMonthlyTotalsDocument, options);
        }
export type GetExpectedMonthlyTotalsQueryHookResult = ReturnType<typeof useGetExpectedMonthlyTotalsQuery>;
export type GetExpectedMonthlyTotalsLazyQueryHookResult = ReturnType<typeof useGetExpectedMonthlyTotalsLazyQuery>;
export type GetExpectedMonthlyTotalsQueryResult = Apollo.QueryResult<GetExpectedMonthlyTotalsQuery, GetExpectedMonthlyTotalsQueryVariables>;