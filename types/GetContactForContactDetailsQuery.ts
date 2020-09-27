/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SendNewsletterEnum, StatusEnum, PledgeFrequencyEnum, LikelyToGiveEnum, PreferredContactMethodEnum, ContactSourceEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetContactForContactDetailsQuery
// ====================================================

export interface GetContactForContactDetailsQuery_accountListUsers_nodes_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetContactForContactDetailsQuery_accountListUsers_nodes {
  id: string;
  user: GetContactForContactDetailsQuery_accountListUsers_nodes_user;
}

export interface GetContactForContactDetailsQuery_accountListUsers {
  /**
   * A list of nodes.
   */
  nodes: (GetContactForContactDetailsQuery_accountListUsers_nodes | null)[] | null;
}

export interface GetContactForContactDetailsQuery_accountList {
  id: string;
  contactTagList: string[];
}

export interface GetContactForContactDetailsQuery_contact_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetContactForContactDetailsQuery_contact_primaryPerson_primaryEmailAddress {
  id: string;
  email: string;
  location: string | null;
}

export interface GetContactForContactDetailsQuery_contact_primaryPerson_primaryPhoneNumber {
  id: string;
  number: string;
  location: string | null;
}

export interface GetContactForContactDetailsQuery_contact_primaryPerson {
  id: string;
  primaryEmailAddress: GetContactForContactDetailsQuery_contact_primaryPerson_primaryEmailAddress | null;
  primaryPhoneNumber: GetContactForContactDetailsQuery_contact_primaryPerson_primaryPhoneNumber | null;
}

export interface GetContactForContactDetailsQuery_contact_primaryAddress {
  id: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  location: string | null;
}

export interface GetContactForContactDetailsQuery_contact_lastDonation_amount {
  amount: number;
  currency: string;
  conversionDate: any;
}

export interface GetContactForContactDetailsQuery_contact_lastDonation {
  id: string;
  paymentMethod: string | null;
  amount: GetContactForContactDetailsQuery_contact_lastDonation_amount;
}

export interface GetContactForContactDetailsQuery_contact_contactReferralsToMe_nodes_referredBy {
  id: string;
  name: string;
}

export interface GetContactForContactDetailsQuery_contact_contactReferralsToMe_nodes {
  id: string;
  referredBy: GetContactForContactDetailsQuery_contact_contactReferralsToMe_nodes_referredBy;
}

export interface GetContactForContactDetailsQuery_contact_contactReferralsToMe {
  /**
   * A list of nodes.
   */
  nodes: (GetContactForContactDetailsQuery_contact_contactReferralsToMe_nodes | null)[] | null;
}

export interface GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes_donorAccount_organization {
  id: string;
  name: string;
}

export interface GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes_donorAccount {
  id: string;
  accountNumber: string;
  organization: GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes_donorAccount_organization;
}

export interface GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes {
  id: string;
  donorAccount: GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes_donorAccount;
}

export interface GetContactForContactDetailsQuery_contact_contactDonorAccounts {
  /**
   * A list of nodes.
   */
  nodes: (GetContactForContactDetailsQuery_contact_contactDonorAccounts_nodes | null)[] | null;
}

export interface GetContactForContactDetailsQuery_contact {
  id: string;
  name: string;
  sendNewsletter: SendNewsletterEnum | null;
  status: StatusEnum | null;
  tagList: string[];
  pledgeAmount: number | null;
  pledgeCurrency: string | null;
  pledgeFrequency: PledgeFrequencyEnum | null;
  pledgeReceived: boolean;
  pledgeStartDate: any | null;
  user: GetContactForContactDetailsQuery_contact_user | null;
  primaryPerson: GetContactForContactDetailsQuery_contact_primaryPerson | null;
  primaryAddress: GetContactForContactDetailsQuery_contact_primaryAddress | null;
  lastDonation: GetContactForContactDetailsQuery_contact_lastDonation | null;
  likelyToGive: LikelyToGiveEnum | null;
  totalDonations: number | null;
  envelopeGreeting: string | null;
  greeting: string | null;
  contactReferralsToMe: GetContactForContactDetailsQuery_contact_contactReferralsToMe;
  noAppeals: boolean | null;
  preferredContactMethod: PreferredContactMethodEnum | null;
  locale: string | null;
  timezone: string | null;
  churchName: string | null;
  nextAsk: any | null;
  website: string | null;
  contactDonorAccounts: GetContactForContactDetailsQuery_contact_contactDonorAccounts;
  notes: string | null;
  source: ContactSourceEnum | null;
}

export interface GetContactForContactDetailsQuery {
  /**
   * AccountListUsers belonging to an AccountList
   */
  accountListUsers: GetContactForContactDetailsQuery_accountListUsers;
  /**
   * AccountList with a given ID
   */
  accountList: GetContactForContactDetailsQuery_accountList;
  /**
   * Contact with a given ID
   */
  contact: GetContactForContactDetailsQuery_contact;
}

export interface GetContactForContactDetailsQueryVariables {
  accountListId: string;
  contactId: string;
}
