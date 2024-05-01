/* eslint-disable */
import * as Types from '../../graphql/types.generated';

import { gql } from '@apollo/client';
import { EditDonationModalDonationFragmentDoc } from '../EditDonationModal/EditDonationModal.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DonationTableQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  pageSize: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  startDate?: Types.InputMaybe<Types.Scalars['ISO8601Date']['input']>;
  endDate?: Types.InputMaybe<Types.Scalars['ISO8601Date']['input']>;
  donorAccountIds?: Types.InputMaybe<
    Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']
  >;
  designationAccountIds?: Types.InputMaybe<
    Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input']
  >;
}>;

export type DonationTableQuery = { __typename?: 'Query' } & {
  donations: { __typename?: 'DonationConnection' } & Pick<
    Types.DonationConnection,
    'totalCount'
  > & {
      nodes: Array<
        { __typename?: 'Donation' } & Pick<
          Types.Donation,
          | 'id'
          | 'donationDate'
          | 'memo'
          | 'motivation'
          | 'paymentMethod'
          | 'remoteId'
        > & {
            amount: { __typename?: 'Money' } & Pick<
              Types.Money,
              'amount' | 'currency' | 'convertedAmount' | 'convertedCurrency'
            >;
            appeal?: Types.Maybe<
              { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id' | 'name'>
            >;
            appealAmount?: Types.Maybe<
              { __typename?: 'Money' } & Pick<Types.Money, 'amount'>
            >;
            donorAccount: { __typename?: 'DonorAccount' } & Pick<
              Types.DonorAccount,
              'id' | 'displayName'
            > & {
                contacts: { __typename?: 'ContactConnection' } & {
                  nodes: Array<
                    { __typename?: 'Contact' } & Pick<Types.Contact, 'id'>
                  >;
                };
              };
            designationAccount: { __typename?: 'DesignationAccount' } & Pick<
              Types.DesignationAccount,
              'id' | 'name'
            >;
          }
      >;
      pageInfo: { __typename?: 'PageInfo' } & Pick<
        Types.PageInfo,
        'endCursor' | 'hasNextPage'
      >;
    };
};

export type DonationTableRowFragment = { __typename?: 'Donation' } & Pick<
  Types.Donation,
  'id' | 'donationDate' | 'paymentMethod'
> & {
    amount: { __typename?: 'Money' } & Pick<
      Types.Money,
      'amount' | 'convertedAmount' | 'convertedCurrency' | 'currency'
    >;
    appeal?: Types.Maybe<
      { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id' | 'name'>
    >;
    donorAccount: { __typename?: 'DonorAccount' } & Pick<
      Types.DonorAccount,
      'id' | 'displayName'
    > & {
        contacts: { __typename?: 'ContactConnection' } & {
          nodes: Array<{ __typename?: 'Contact' } & Pick<Types.Contact, 'id'>>;
        };
      };
    designationAccount: { __typename?: 'DesignationAccount' } & Pick<
      Types.DesignationAccount,
      'id' | 'name'
    >;
  };

export type AccountListCurrencyQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
}>;

export type AccountListCurrencyQuery = { __typename?: 'Query' } & {
  accountList: { __typename?: 'AccountList' } & Pick<
    Types.AccountList,
    'id' | 'currency'
  >;
};

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
export const DonationTableDocument = gql`
  query DonationTable(
    $accountListId: ID!
    $pageSize: Int!
    $after: String
    $startDate: ISO8601Date
    $endDate: ISO8601Date
    $donorAccountIds: [ID!]
    $designationAccountIds: [ID!]
  ) {
    donations(
      accountListId: $accountListId
      donationDate: { max: $endDate, min: $startDate }
      donorAccountId: $donorAccountIds
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
  ${DonationTableRowFragmentDoc}
`;

/**
 * __useDonationTableQuery__
 *
 * To run a query within a React component, call `useDonationTableQuery` and pass it any options that fit your needs.
 * When your component renders, `useDonationTableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDonationTableQuery({
 *   variables: {
 *      accountListId: // value for 'accountListId'
 *      pageSize: // value for 'pageSize'
 *      after: // value for 'after'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      donorAccountIds: // value for 'donorAccountIds'
 *      designationAccountIds: // value for 'designationAccountIds'
 *   },
 * });
 */
export function useDonationTableQuery(
  baseOptions: Apollo.QueryHookOptions<
    DonationTableQuery,
    DonationTableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DonationTableQuery, DonationTableQueryVariables>(
    DonationTableDocument,
    options,
  );
}
export function useDonationTableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DonationTableQuery,
    DonationTableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DonationTableQuery, DonationTableQueryVariables>(
    DonationTableDocument,
    options,
  );
}
export type DonationTableQueryHookResult = ReturnType<
  typeof useDonationTableQuery
>;
export type DonationTableLazyQueryHookResult = ReturnType<
  typeof useDonationTableLazyQuery
>;
export type DonationTableQueryResult = Apollo.QueryResult<
  DonationTableQuery,
  DonationTableQueryVariables
>;
export const AccountListCurrencyDocument = gql`
  query AccountListCurrency($accountListId: ID!) {
    accountList(id: $accountListId) {
      id
      currency
    }
  }
`;

/**
 * __useAccountListCurrencyQuery__
 *
 * To run a query within a React component, call `useAccountListCurrencyQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountListCurrencyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountListCurrencyQuery({
 *   variables: {
 *      accountListId: // value for 'accountListId'
 *   },
 * });
 */
export function useAccountListCurrencyQuery(
  baseOptions: Apollo.QueryHookOptions<
    AccountListCurrencyQuery,
    AccountListCurrencyQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    AccountListCurrencyQuery,
    AccountListCurrencyQueryVariables
  >(AccountListCurrencyDocument, options);
}
export function useAccountListCurrencyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AccountListCurrencyQuery,
    AccountListCurrencyQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AccountListCurrencyQuery,
    AccountListCurrencyQueryVariables
  >(AccountListCurrencyDocument, options);
}
export type AccountListCurrencyQueryHookResult = ReturnType<
  typeof useAccountListCurrencyQuery
>;
export type AccountListCurrencyLazyQueryHookResult = ReturnType<
  typeof useAccountListCurrencyLazyQuery
>;
export type AccountListCurrencyQueryResult = Apollo.QueryResult<
  AccountListCurrencyQuery,
  AccountListCurrencyQueryVariables
>;
