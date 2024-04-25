import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type FourteenMonthReportQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  designationAccountIds?: Types.InputMaybe<Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']>;
  currencyType: Types.FourteenMonthReportCurrencyType;
}>;


export type FourteenMonthReportQuery = (
  { __typename?: 'Query' }
  & { fourteenMonthReport: (
    { __typename?: 'FourteenMonthReport' }
    & Pick<Types.FourteenMonthReport, 'currencyType' | 'salaryCurrency'>
    & { currencyGroups: Array<(
      { __typename?: 'FourteenMonthReportCurrencyGroup' }
      & Pick<Types.FourteenMonthReportCurrencyGroup, 'currency'>
      & { totals: (
        { __typename?: 'FourteenMonthReportCurrencyGroupTotals' }
        & Pick<Types.FourteenMonthReportCurrencyGroupTotals, 'year' | 'average' | 'minimum'>
        & { months: Array<(
          { __typename?: 'FourteenMonthReportCurrencyGroupTotalsMonth' }
          & Pick<Types.FourteenMonthReportCurrencyGroupTotalsMonth, 'month' | 'total'>
        )> }
      ), contacts: Array<(
        { __typename?: 'FourteenMonthReportContact' }
        & Pick<Types.FourteenMonthReportContact, 'id' | 'name' | 'total' | 'average' | 'minimum' | 'accountNumbers' | 'lateBy30Days' | 'lateBy60Days' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency' | 'status'>
        & { months?: Types.Maybe<Array<(
          { __typename?: 'FourteenMonthReportContactMonths' }
          & Pick<Types.FourteenMonthReportContactMonths, 'month' | 'total' | 'salaryCurrencyTotal'>
          & { donations: Array<(
            { __typename?: 'FourteenMonthReportContactDonation' }
            & Pick<Types.FourteenMonthReportContactDonation, 'amount' | 'currency' | 'date' | 'paymentMethod'>
          )> }
        )>> }
      )> }
    )> }
  ) }
);


export const FourteenMonthReportDocument = gql`
    query FourteenMonthReport($accountListId: ID!, $designationAccountIds: [ID!], $currencyType: FourteenMonthReportCurrencyType!) {
  fourteenMonthReport(
    accountListId: $accountListId
    designationAccountId: $designationAccountIds
    currencyType: $currencyType
  ) {
    currencyType
    salaryCurrency
    currencyGroups {
      currency
      totals {
        year
        months {
          month
          total
        }
        average
        minimum
      }
      contacts {
        id
        name
        total
        average
        minimum
        months {
          month
          total
          salaryCurrencyTotal
          donations {
            amount
            currency
            date
            paymentMethod
          }
        }
        accountNumbers
        lateBy30Days
        lateBy60Days
        pledgeAmount
        pledgeCurrency
        pledgeFrequency
        status
      }
    }
  }
}
    `;
export function useFourteenMonthReportQuery(baseOptions: Apollo.QueryHookOptions<FourteenMonthReportQuery, FourteenMonthReportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FourteenMonthReportQuery, FourteenMonthReportQueryVariables>(FourteenMonthReportDocument, options);
      }
export function useFourteenMonthReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FourteenMonthReportQuery, FourteenMonthReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FourteenMonthReportQuery, FourteenMonthReportQueryVariables>(FourteenMonthReportDocument, options);
        }
export type FourteenMonthReportQueryHookResult = ReturnType<typeof useFourteenMonthReportQuery>;
export type FourteenMonthReportLazyQueryHookResult = ReturnType<typeof useFourteenMonthReportLazyQuery>;
export type FourteenMonthReportQueryResult = Apollo.QueryResult<FourteenMonthReportQuery, FourteenMonthReportQueryVariables>;