import * as Types from '../../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactDonorAccountsFragmentDoc } from '../../ContactDonationsTab/ContactDonationsTab.generated';
export type ContactHeaderStatusFragment = { __typename?: 'Contact' } & Pick<
  Types.Contact,
  | 'id'
  | 'status'
  | 'lateAt'
  | 'name'
  | 'nextAsk'
  | 'pledgeReceived'
  | 'pledgeStartDate'
  | 'pledgeAmount'
  | 'pledgeCurrency'
  | 'pledgeFrequency'
  | 'totalDonations'
  | 'noAppeals'
  | 'sendNewsletter'
  | 'source'
  | 'likelyToGive'
> & {
    lastDonation?: Types.Maybe<
      { __typename?: 'Donation' } & Pick<
        Types.Donation,
        'id' | 'donationDate' | 'paymentMethod'
      > & {
          amount: { __typename?: 'Money' } & Pick<
            Types.Money,
            'amount' | 'convertedAmount' | 'currency' | 'convertedCurrency'
          >;
          appeal?: Types.Maybe<
            { __typename?: 'Appeal' } & Pick<Types.Appeal, 'id' | 'name'>
          >;
        }
    >;
    contactReferralsToMe: { __typename?: 'ReferralConnection' } & {
      nodes: Array<
        { __typename?: 'Referral' } & Pick<Types.Referral, 'id'> & {
            referredBy: { __typename?: 'Contact' } & Pick<
              Types.Contact,
              'id' | 'name'
            >;
          }
      >;
    };
    contactDonorAccounts: { __typename?: 'ContactDonorAccountConnection' } & {
      nodes: Array<
        { __typename?: 'ContactDonorAccount' } & Pick<
          Types.ContactDonorAccount,
          'id'
        > & {
            donorAccount: { __typename?: 'DonorAccount' } & Pick<
              Types.DonorAccount,
              'id' | 'displayName' | 'accountNumber'
            >;
          }
      >;
    };
  };

export const ContactHeaderStatusFragmentDoc = gql`
  fragment ContactHeaderStatus on Contact {
    id
    status
    lateAt
    ...ContactDonorAccounts
  }
  ${ContactDonorAccountsFragmentDoc}
`;
