import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetContactDonationsQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
}>;


export type GetContactDonationsQuery = (
  { __typename?: 'Query' }
  & { contact: (
    { __typename?: 'Contact' }
    & Pick<Types.Contact, 'id' | 'name' | 'nextAsk' | 'pledgeReceived' | 'pledgeStartDate' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency' | 'totalDonations' | 'noAppeals' | 'sendNewsletter' | 'status' | 'source' | 'likelyToGive'>
    & { lastDonation?: Types.Maybe<(
      { __typename?: 'Donation' }
      & Pick<Types.Donation, 'id' | 'donationDate' | 'paymentMethod'>
      & { amount: (
        { __typename?: 'Money' }
        & Pick<Types.Money, 'amount' | 'convertedAmount' | 'currency' | 'convertedCurrency'>
      ), appeal?: Types.Maybe<(
        { __typename?: 'Appeal' }
        & Pick<Types.Appeal, 'id' | 'name'>
      )> }
    )>, contactReferralsToMe: (
      { __typename?: 'ReferralConnection' }
      & { nodes: Array<(
        { __typename?: 'Referral' }
        & Pick<Types.Referral, 'id'>
        & { referredBy: (
          { __typename?: 'Contact' }
          & Pick<Types.Contact, 'id' | 'name'>
        ) }
      )> }
    ), contactDonorAccounts: (
      { __typename?: 'ContactDonorAccountConnection' }
      & { nodes: Array<(
        { __typename?: 'ContactDonorAccount' }
        & Pick<Types.ContactDonorAccount, 'id'>
        & { donorAccount: (
          { __typename?: 'DonorAccount' }
          & Pick<Types.DonorAccount, 'id' | 'displayName' | 'accountNumber'>
        ) }
      )> }
    ) }
  ) }
);

export type ContactDonorAccountsFragment = (
  { __typename?: 'Contact' }
  & Pick<Types.Contact, 'id' | 'name' | 'nextAsk' | 'pledgeReceived' | 'pledgeStartDate' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency' | 'totalDonations' | 'noAppeals' | 'sendNewsletter' | 'status' | 'source' | 'likelyToGive'>
  & { lastDonation?: Types.Maybe<(
    { __typename?: 'Donation' }
    & Pick<Types.Donation, 'id' | 'donationDate' | 'paymentMethod'>
    & { amount: (
      { __typename?: 'Money' }
      & Pick<Types.Money, 'amount' | 'convertedAmount' | 'currency' | 'convertedCurrency'>
    ), appeal?: Types.Maybe<(
      { __typename?: 'Appeal' }
      & Pick<Types.Appeal, 'id' | 'name'>
    )> }
  )>, contactReferralsToMe: (
    { __typename?: 'ReferralConnection' }
    & { nodes: Array<(
      { __typename?: 'Referral' }
      & Pick<Types.Referral, 'id'>
      & { referredBy: (
        { __typename?: 'Contact' }
        & Pick<Types.Contact, 'id' | 'name'>
      ) }
    )> }
  ), contactDonorAccounts: (
    { __typename?: 'ContactDonorAccountConnection' }
    & { nodes: Array<(
      { __typename?: 'ContactDonorAccount' }
      & Pick<Types.ContactDonorAccount, 'id'>
      & { donorAccount: (
        { __typename?: 'DonorAccount' }
        & Pick<Types.DonorAccount, 'id' | 'displayName' | 'accountNumber'>
      ) }
    )> }
  ) }
);

export type ContactDonationFragment = (
  { __typename?: 'Donation' }
  & Pick<Types.Donation, 'id' | 'donationDate' | 'paymentMethod'>
  & { amount: (
    { __typename?: 'Money' }
    & Pick<Types.Money, 'amount' | 'convertedAmount' | 'currency' | 'convertedCurrency'>
  ), appeal?: Types.Maybe<(
    { __typename?: 'Appeal' }
    & Pick<Types.Appeal, 'id' | 'name'>
  )> }
);

export type DonationMoneyFragment = (
  { __typename?: 'Money' }
  & Pick<Types.Money, 'amount' | 'convertedAmount' | 'currency' | 'convertedCurrency'>
);

export type ContactDonorAccountFragment = (
  { __typename?: 'DonorAccount' }
  & Pick<Types.DonorAccount, 'id' | 'displayName' | 'accountNumber'>
);

export const DonationMoneyFragmentDoc = gql`
    fragment DonationMoney on Money {
  amount
  convertedAmount
  currency
  convertedCurrency
}
    `;
export const ContactDonationFragmentDoc = gql`
    fragment ContactDonation on Donation {
  id
  donationDate
  paymentMethod
  amount {
    ...DonationMoney
  }
  appeal {
    id
    name
  }
}
    ${DonationMoneyFragmentDoc}`;
export const ContactDonorAccountFragmentDoc = gql`
    fragment ContactDonorAccount on DonorAccount {
  id
  displayName
  accountNumber
}
    `;
export const ContactDonorAccountsFragmentDoc = gql`
    fragment ContactDonorAccounts on Contact {
  id
  name
  nextAsk
  pledgeReceived
  pledgeStartDate
  pledgeAmount
  pledgeCurrency
  pledgeFrequency
  totalDonations
  noAppeals
  sendNewsletter
  status
  source
  likelyToGive
  lastDonation {
    ...ContactDonation
  }
  contactReferralsToMe(first: 10) {
    nodes {
      id
      referredBy {
        id
        name
      }
    }
  }
  contactDonorAccounts(first: 25) {
    nodes {
      id
      donorAccount {
        ...ContactDonorAccount
      }
    }
  }
}
    ${ContactDonationFragmentDoc}
${ContactDonorAccountFragmentDoc}`;
export const GetContactDonationsDocument = gql`
    query GetContactDonations($accountListId: ID!, $contactId: ID!) {
  contact(accountListId: $accountListId, id: $contactId) {
    id
    ...ContactDonorAccounts
    name
    lastDonation {
      ...ContactDonation
    }
  }
}
    ${ContactDonorAccountsFragmentDoc}
${ContactDonationFragmentDoc}`;
export function useGetContactDonationsQuery(baseOptions: Apollo.QueryHookOptions<GetContactDonationsQuery, GetContactDonationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContactDonationsQuery, GetContactDonationsQueryVariables>(GetContactDonationsDocument, options);
      }
export function useGetContactDonationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContactDonationsQuery, GetContactDonationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContactDonationsQuery, GetContactDonationsQueryVariables>(GetContactDonationsDocument, options);
        }
export type GetContactDonationsQueryHookResult = ReturnType<typeof useGetContactDonationsQuery>;
export type GetContactDonationsLazyQueryHookResult = ReturnType<typeof useGetContactDonationsLazyQuery>;
export type GetContactDonationsQueryResult = Apollo.QueryResult<GetContactDonationsQuery, GetContactDonationsQueryVariables>;