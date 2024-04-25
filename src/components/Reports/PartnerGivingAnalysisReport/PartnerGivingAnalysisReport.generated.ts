import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetPartnerGivingAnalysisReportQueryVariables = Types.Exact<{
  input: Types.PartnerGivingAnalysisReportInput;
}>;


export type GetPartnerGivingAnalysisReportQuery = (
  { __typename?: 'Query' }
  & { partnerGivingAnalysisReport: (
    { __typename?: 'PartnerGivingAnalysisReport' }
    & Pick<Types.PartnerGivingAnalysisReport, 'totalContacts'>
    & { contacts: Array<(
      { __typename?: 'PartnerGivingAnalysisReportContact' }
      & Pick<Types.PartnerGivingAnalysisReportContact, 'id' | 'donationPeriodAverage' | 'donationPeriodCount' | 'donationPeriodSum' | 'lastDonationAmount' | 'lastDonationCurrency' | 'lastDonationDate' | 'name' | 'pledgeCurrency' | 'totalDonations'>
    )>, pagination: (
      { __typename?: 'PartnerGivingAnalysisReportPagination' }
      & Pick<Types.PartnerGivingAnalysisReportPagination, 'page' | 'pageSize' | 'totalItems' | 'totalPages'>
    ) }
  ) }
);


export const GetPartnerGivingAnalysisReportDocument = gql`
    query GetPartnerGivingAnalysisReport($input: PartnerGivingAnalysisReportInput!) {
  partnerGivingAnalysisReport(input: $input) {
    contacts {
      id
      donationPeriodAverage
      donationPeriodCount
      donationPeriodSum
      lastDonationAmount
      lastDonationCurrency
      lastDonationDate
      name
      pledgeCurrency
      totalDonations
    }
    pagination {
      page
      pageSize
      totalItems
      totalPages
    }
    totalContacts
  }
}
    `;
export function useGetPartnerGivingAnalysisReportQuery(baseOptions: Apollo.QueryHookOptions<GetPartnerGivingAnalysisReportQuery, GetPartnerGivingAnalysisReportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPartnerGivingAnalysisReportQuery, GetPartnerGivingAnalysisReportQueryVariables>(GetPartnerGivingAnalysisReportDocument, options);
      }
export function useGetPartnerGivingAnalysisReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPartnerGivingAnalysisReportQuery, GetPartnerGivingAnalysisReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPartnerGivingAnalysisReportQuery, GetPartnerGivingAnalysisReportQueryVariables>(GetPartnerGivingAnalysisReportDocument, options);
        }
export type GetPartnerGivingAnalysisReportQueryHookResult = ReturnType<typeof useGetPartnerGivingAnalysisReportQuery>;
export type GetPartnerGivingAnalysisReportLazyQueryHookResult = ReturnType<typeof useGetPartnerGivingAnalysisReportLazyQuery>;
export type GetPartnerGivingAnalysisReportQueryResult = Apollo.QueryResult<GetPartnerGivingAnalysisReportQuery, GetPartnerGivingAnalysisReportQueryVariables>;