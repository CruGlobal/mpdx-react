import * as Types from '../../../../graphql/types.generated';

import { gql } from '@apollo/client';
import { ContactDetailsFragmentDoc } from '../ContactDetailsTab/People/Items/EditContactDetailsModal/EditContactDetails.generated';
import { ContactHeaderAddressFragmentDoc } from './ContactHeaderSection/ContactHeaderAddress.generated';
import { ContactHeaderEmailFragmentDoc } from './ContactHeaderSection/ContactHeaderEmail.generated';
import { ContactHeaderPhoneFragmentDoc } from './ContactHeaderSection/ContactHeaderPhone.generated';
import { ContactHeaderStatusFragmentDoc } from './ContactHeaderSection/ContactHeaderStatus.generated';
import { ContactHeaderNewsletterFragmentDoc } from './ContactHeaderSection/ContactHeaderNewsletter.generated';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type ContactDetailsHeaderFragment = (
  { __typename?: 'Contact' }
  & Pick<Types.Contact, 'id' | 'avatar' | 'name' | 'starred' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter' | 'status' | 'lateAt' | 'nextAsk' | 'pledgeReceived' | 'pledgeStartDate' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency' | 'totalDonations' | 'noAppeals' | 'source' | 'likelyToGive'>
  & { primaryPerson?: Types.Maybe<(
    { __typename?: 'Person' }
    & Pick<Types.Person, 'firstName' | 'lastName' | 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'gender' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
    & { primaryEmailAddress?: Types.Maybe<(
      { __typename?: 'EmailAddress' }
      & Pick<Types.EmailAddress, 'email' | 'id' | 'primary' | 'location' | 'source'>
    )>, primaryPhoneNumber?: Types.Maybe<(
      { __typename?: 'PhoneNumber' }
      & Pick<Types.PhoneNumber, 'number' | 'location' | 'id' | 'primary' | 'source'>
    )>, emailAddresses: (
      { __typename?: 'EmailAddressConnection' }
      & { nodes: Array<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
      )> }
    ), facebookAccounts: (
      { __typename?: 'FacebookAccountConnection' }
      & { nodes: Array<(
        { __typename?: 'FacebookAccount' }
        & Pick<Types.FacebookAccount, 'id' | 'username'>
      )> }
    ), linkedinAccounts: (
      { __typename?: 'LinkedinAccountConnection' }
      & { nodes: Array<(
        { __typename?: 'LinkedinAccount' }
        & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
      )> }
    ), phoneNumbers: (
      { __typename?: 'PhoneNumberConnection' }
      & { nodes: Array<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
      )> }
    ), twitterAccounts: (
      { __typename?: 'TwitterAccountConnection' }
      & { nodes: Array<(
        { __typename?: 'TwitterAccount' }
        & Pick<Types.TwitterAccount, 'id' | 'screenName'>
      )> }
    ), websites: (
      { __typename?: 'WebsiteConnection' }
      & { nodes: Array<(
        { __typename?: 'Website' }
        & Pick<Types.Website, 'id' | 'url'>
      )> }
    ) }
  )>, people: (
    { __typename?: 'PersonConnection' }
    & { nodes: Array<(
      { __typename?: 'Person' }
      & Pick<Types.Person, 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'firstName' | 'gender' | 'lastName' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
      & { emailAddresses: (
        { __typename?: 'EmailAddressConnection' }
        & { nodes: Array<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
        )> }
      ), facebookAccounts: (
        { __typename?: 'FacebookAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'FacebookAccount' }
          & Pick<Types.FacebookAccount, 'id' | 'username'>
        )> }
      ), linkedinAccounts: (
        { __typename?: 'LinkedinAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'LinkedinAccount' }
          & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
        )> }
      ), phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
        )> }
      ), primaryEmailAddress?: Types.Maybe<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source'>
      )>, primaryPhoneNumber?: Types.Maybe<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source'>
      )>, twitterAccounts: (
        { __typename?: 'TwitterAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'TwitterAccount' }
          & Pick<Types.TwitterAccount, 'id' | 'screenName'>
        )> }
      ), websites: (
        { __typename?: 'WebsiteConnection' }
        & { nodes: Array<(
          { __typename?: 'Website' }
          & Pick<Types.Website, 'id' | 'url'>
        )> }
      ) }
    )> }
  ), addresses: (
    { __typename?: 'AddressConnection' }
    & { nodes: Array<(
      { __typename?: 'Address' }
      & Pick<Types.Address, 'city' | 'country' | 'historic' | 'id' | 'location' | 'metroArea' | 'postalCode' | 'primaryMailingAddress' | 'region' | 'source' | 'state' | 'street'>
    )> }
  ), primaryAddress?: Types.Maybe<(
    { __typename?: 'Address' }
    & Pick<Types.Address, 'id' | 'street' | 'city' | 'state' | 'postalCode' | 'country'>
  )>, lastDonation?: Types.Maybe<(
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

export type GetContactDetailsHeaderQueryVariables = Types.Exact<{
  accountListId: Types.Scalars['ID']['input'];
  contactId: Types.Scalars['ID']['input'];
}>;


export type GetContactDetailsHeaderQuery = (
  { __typename?: 'Query' }
  & { contact: (
    { __typename?: 'Contact' }
    & Pick<Types.Contact, 'id' | 'avatar' | 'name' | 'starred' | 'greeting' | 'envelopeGreeting' | 'sendNewsletter' | 'status' | 'lateAt' | 'nextAsk' | 'pledgeReceived' | 'pledgeStartDate' | 'pledgeAmount' | 'pledgeCurrency' | 'pledgeFrequency' | 'totalDonations' | 'noAppeals' | 'source' | 'likelyToGive'>
    & { primaryPerson?: Types.Maybe<(
      { __typename?: 'Person' }
      & Pick<Types.Person, 'firstName' | 'lastName' | 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'gender' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
      & { primaryEmailAddress?: Types.Maybe<(
        { __typename?: 'EmailAddress' }
        & Pick<Types.EmailAddress, 'email' | 'id' | 'primary' | 'location' | 'source'>
      )>, primaryPhoneNumber?: Types.Maybe<(
        { __typename?: 'PhoneNumber' }
        & Pick<Types.PhoneNumber, 'number' | 'location' | 'id' | 'primary' | 'source'>
      )>, emailAddresses: (
        { __typename?: 'EmailAddressConnection' }
        & { nodes: Array<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
        )> }
      ), facebookAccounts: (
        { __typename?: 'FacebookAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'FacebookAccount' }
          & Pick<Types.FacebookAccount, 'id' | 'username'>
        )> }
      ), linkedinAccounts: (
        { __typename?: 'LinkedinAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'LinkedinAccount' }
          & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
        )> }
      ), phoneNumbers: (
        { __typename?: 'PhoneNumberConnection' }
        & { nodes: Array<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
        )> }
      ), twitterAccounts: (
        { __typename?: 'TwitterAccountConnection' }
        & { nodes: Array<(
          { __typename?: 'TwitterAccount' }
          & Pick<Types.TwitterAccount, 'id' | 'screenName'>
        )> }
      ), websites: (
        { __typename?: 'WebsiteConnection' }
        & { nodes: Array<(
          { __typename?: 'Website' }
          & Pick<Types.Website, 'id' | 'url'>
        )> }
      ) }
    )>, people: (
      { __typename?: 'PersonConnection' }
      & { nodes: Array<(
        { __typename?: 'Person' }
        & Pick<Types.Person, 'id' | 'avatar' | 'almaMater' | 'anniversaryDay' | 'anniversaryMonth' | 'anniversaryYear' | 'birthdayDay' | 'birthdayMonth' | 'birthdayYear' | 'deceased' | 'employer' | 'firstName' | 'gender' | 'lastName' | 'legalFirstName' | 'maritalStatus' | 'occupation' | 'optoutEnewsletter' | 'suffix' | 'title'>
        & { emailAddresses: (
          { __typename?: 'EmailAddressConnection' }
          & { nodes: Array<(
            { __typename?: 'EmailAddress' }
            & Pick<Types.EmailAddress, 'id' | 'email' | 'historic' | 'primary' | 'location' | 'source'>
          )> }
        ), facebookAccounts: (
          { __typename?: 'FacebookAccountConnection' }
          & { nodes: Array<(
            { __typename?: 'FacebookAccount' }
            & Pick<Types.FacebookAccount, 'id' | 'username'>
          )> }
        ), linkedinAccounts: (
          { __typename?: 'LinkedinAccountConnection' }
          & { nodes: Array<(
            { __typename?: 'LinkedinAccount' }
            & Pick<Types.LinkedinAccount, 'id' | 'publicUrl'>
          )> }
        ), phoneNumbers: (
          { __typename?: 'PhoneNumberConnection' }
          & { nodes: Array<(
            { __typename?: 'PhoneNumber' }
            & Pick<Types.PhoneNumber, 'id' | 'historic' | 'number' | 'primary' | 'location' | 'source'>
          )> }
        ), primaryEmailAddress?: Types.Maybe<(
          { __typename?: 'EmailAddress' }
          & Pick<Types.EmailAddress, 'id' | 'email' | 'primary' | 'location' | 'source'>
        )>, primaryPhoneNumber?: Types.Maybe<(
          { __typename?: 'PhoneNumber' }
          & Pick<Types.PhoneNumber, 'id' | 'number' | 'primary' | 'location' | 'source'>
        )>, twitterAccounts: (
          { __typename?: 'TwitterAccountConnection' }
          & { nodes: Array<(
            { __typename?: 'TwitterAccount' }
            & Pick<Types.TwitterAccount, 'id' | 'screenName'>
          )> }
        ), websites: (
          { __typename?: 'WebsiteConnection' }
          & { nodes: Array<(
            { __typename?: 'Website' }
            & Pick<Types.Website, 'id' | 'url'>
          )> }
        ) }
      )> }
    ), addresses: (
      { __typename?: 'AddressConnection' }
      & { nodes: Array<(
        { __typename?: 'Address' }
        & Pick<Types.Address, 'city' | 'country' | 'historic' | 'id' | 'location' | 'metroArea' | 'postalCode' | 'primaryMailingAddress' | 'region' | 'source' | 'state' | 'street'>
      )> }
    ), primaryAddress?: Types.Maybe<(
      { __typename?: 'Address' }
      & Pick<Types.Address, 'id' | 'street' | 'city' | 'state' | 'postalCode' | 'country'>
    )>, lastDonation?: Types.Maybe<(
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

export const ContactDetailsHeaderFragmentDoc = gql`
    fragment ContactDetailsHeader on Contact {
  id
  avatar
  name
  primaryPerson {
    firstName
    lastName
  }
  starred
  ...ContactDetails
  ...ContactHeaderAddress
  ...ContactHeaderEmail
  ...ContactHeaderPhone
  ...ContactHeaderStatus
  ...ContactHeaderNewsletter
}
    ${ContactDetailsFragmentDoc}
${ContactHeaderAddressFragmentDoc}
${ContactHeaderEmailFragmentDoc}
${ContactHeaderPhoneFragmentDoc}
${ContactHeaderStatusFragmentDoc}
${ContactHeaderNewsletterFragmentDoc}`;
export const GetContactDetailsHeaderDocument = gql`
    query GetContactDetailsHeader($accountListId: ID!, $contactId: ID!) {
  contact(accountListId: $accountListId, id: $contactId) {
    ...ContactDetailsHeader
  }
}
    ${ContactDetailsHeaderFragmentDoc}`;
export function useGetContactDetailsHeaderQuery(baseOptions: Apollo.QueryHookOptions<GetContactDetailsHeaderQuery, GetContactDetailsHeaderQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetContactDetailsHeaderQuery, GetContactDetailsHeaderQueryVariables>(GetContactDetailsHeaderDocument, options);
      }
export function useGetContactDetailsHeaderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetContactDetailsHeaderQuery, GetContactDetailsHeaderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetContactDetailsHeaderQuery, GetContactDetailsHeaderQueryVariables>(GetContactDetailsHeaderDocument, options);
        }
export type GetContactDetailsHeaderQueryHookResult = ReturnType<typeof useGetContactDetailsHeaderQuery>;
export type GetContactDetailsHeaderLazyQueryHookResult = ReturnType<typeof useGetContactDetailsHeaderLazyQuery>;
export type GetContactDetailsHeaderQueryResult = Apollo.QueryResult<GetContactDetailsHeaderQuery, GetContactDetailsHeaderQueryVariables>;