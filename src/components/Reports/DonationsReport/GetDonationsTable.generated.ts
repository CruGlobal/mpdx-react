import * as Types from '../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { EditDonationModalDonationFragmentDoc } from '../../EditDonationModal/EditDonationModal.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDonationsTableQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  pageSize: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  startDate?: Types.InputMaybe<Types.Scalars['ISO8601Date']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['ISO8601Date']['input']>;
  designationAccountIds?: Types.InputMaybe<Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']>;
}>;


export type GetDonationsTableQuery = (
  { __typename?: 'Query' }
  & { donations: (
    { __typename?: 'DonationConnection' }
    & Pick<Types.DonationConnection, 'totalCount'>
    & { nodes: Array<(
      { __typename?: 'Donation' }
      & Pick<Types.Donation, 'id' | 'donationDate' | 'memo' | 'motivation' | 'paymentMethod' | 'remoteId'>
      & { amount: (
        { __typename?: 'Money' }
        & Pick<Types.Money, 'amount' | 'currency' | 'convertedAmount' | 'convertedCurrency'>
      ), appeal?: Types.Maybe<(
        { __typename?: 'Appeal' }
        & Pick<Types.Appeal, 'id' | 'name'>
      )>, appealAmount?: Types.Maybe<(
        { __typename?: 'Money' }
        & Pick<Types.Money, 'amount'>
      )>, donorAccount: (
        { __typename?: 'DonorAccount' }
        & Pick<Types.DonorAccount, 'id' | 'displayName'>
        & { contacts: (
          { __typename?: 'ContactConnection' }
          & { nodes: Array<(
            { __typename?: 'Contact' }
            & Pick<Types.Contact, 'id'>
          )> }
        ) }
      ), designationAccount: (
        { __typename?: 'DesignationAccount' }
        & Pick<Types.DesignationAccount, 'id' | 'name'>
      ) }
    )>, pageInfo: (
      { __typename?: 'PageInfo' }
      & Pick<Types.PageInfo, 'endCursor' | 'hasNextPage'>
    ) }
  ) }
);

export type DonationTableRowFragment = (
  { __typename?: 'Donation' }
  & Pick<Types.Donation, 'id' | 'donationDate' | 'paymentMethod'>
  & { amount: (
    { __typename?: 'Money' }
    & Pick<Types.Money, 'amount' | 'convertedAmount' | 'convertedCurrency' | 'currency'>
  ), appeal?: Types.Maybe<(
    { __typename?: 'Appeal' }
    & Pick<Types.Appeal, 'id' | 'name'>
  )>, donorAccount: (
    { __typename?: 'DonorAccount' }
    & Pick<Types.DonorAccount, 'id' | 'displayName'>
    & { contacts: (
      { __typename?: 'ContactConnection' }
      & { nodes: Array<(
        { __typename?: 'Contact' }
        & Pick<Types.Contact, 'id'>
      )> }
    ) }
  ), designationAccount: (
    { __typename?: 'DesignationAccount' }
    & Pick<Types.DesignationAccount, 'id' | 'name'>
  ) }
);

export type GetAccountListCurrencyQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;


export type GetAccountListCurrencyQuery = (
  { __typename?: 'Query' }
  & { accountList: (
    { __typename?: 'AccountList' }
    & Pick<Types.AccountList, 'id' | 'currency'>
  ) }
);

export const DonationTableRowFragmentDoc = gql`
    fragment DonationTableRow on Donation {
  id
  amount {
    amount
    convertedAmount
    convertedCurrency
    currency
  }
  appeal {
    id
    name
  }
  donationDate
  donorAccount {
    id
    contacts(first: 25) {
      nodes {
        id
      }
    }
    displayName
  }
  designationAccount {
    id
    name
  }
  paymentMethod
}
    `;
export const GetDonationsTableDocument = gql`
    query GetDonationsTable($accountListId: ID!, $pageSize: Int!, $after: String, $startDate: ISO8601Date, $endDate: ISO8601Date, $designationAccountIds: [ID!]) {
  donations(
    accountListId: $accountListId
    donationDate: {max: $endDate, min: $startDate}
    designationAccountId: $designationAccountIds
    first: $pageSize
    after: $after
  ) {
    nodes {
      ...EditDonationModalDonation
      ...DonationTableRow
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    totalCount
  }
}
    ${EditDonationModalDonationFragmentDoc}
${DonationTableRowFragmentDoc}`;
export function useGetDonationsTableQuery(baseOptions: Apollo.QueryHookOptions<GetDonationsTableQuery, GetDonationsTableQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDonationsTableQuery, GetDonationsTableQueryVariables>(GetDonationsTableDocument, options);
      }
export function useGetDonationsTableLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDonationsTableQuery, GetDonationsTableQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDonationsTableQuery, GetDonationsTableQueryVariables>(GetDonationsTableDocument, options);
        }
export type GetDonationsTableQueryHookResult = ReturnType<typeof useGetDonationsTableQuery>;
export type GetDonationsTableLazyQueryHookResult = ReturnType<typeof useGetDonationsTableLazyQuery>;
export type GetDonationsTableQueryResult = Apollo.QueryResult<GetDonationsTableQuery, GetDonationsTableQueryVariables>;
export const GetAccountListCurrencyDocument = gql`
    query GetAccountListCurrency($accountListId: ID!) {
  accountList(id: $accountListId) {
    id
    currency
  }
}
    `;
export function useGetAccountListCurrencyQuery(baseOptions: Apollo.QueryHookOptions<GetAccountListCurrencyQuery, GetAccountListCurrencyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAccountListCurrencyQuery, GetAccountListCurrencyQueryVariables>(GetAccountListCurrencyDocument, options);
      }
export function useGetAccountListCurrencyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAccountListCurrencyQuery, GetAccountListCurrencyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAccountListCurrencyQuery, GetAccountListCurrencyQueryVariables>(GetAccountListCurrencyDocument, options);
        }
export type GetAccountListCurrencyQueryHookResult = ReturnType<typeof useGetAccountListCurrencyQuery>;
export type GetAccountListCurrencyLazyQueryHookResult = ReturnType<typeof useGetAccountListCurrencyLazyQuery>;
export type GetAccountListCurrencyQueryResult = Apollo.QueryResult<GetAccountListCurrencyQuery, GetAccountListCurrencyQueryVariables>;