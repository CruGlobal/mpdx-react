/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ContactUpdateInput, SendNewsletterEnum, StatusEnum, PledgeFrequencyEnum, LikelyToGiveEnum, PreferredContactMethodEnum, ContactSourceEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateContactMutation
// ====================================================

export interface UpdateContactMutation_updateContact_contact_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface UpdateContactMutation_updateContact_contact_primaryPerson_primaryEmailAddress {
  id: string;
  email: string;
  location: string | null;
}

export interface UpdateContactMutation_updateContact_contact_primaryPerson_primaryPhoneNumber {
  id: string;
  number: string;
  location: string | null;
}

export interface UpdateContactMutation_updateContact_contact_primaryPerson {
  id: string;
  primaryEmailAddress: UpdateContactMutation_updateContact_contact_primaryPerson_primaryEmailAddress | null;
  primaryPhoneNumber: UpdateContactMutation_updateContact_contact_primaryPerson_primaryPhoneNumber | null;
}

export interface UpdateContactMutation_updateContact_contact_primaryAddress {
  id: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  location: string | null;
}

export interface UpdateContactMutation_updateContact_contact_lastDonation_amount {
  amount: number;
  currency: string;
  conversionDate: any;
}

export interface UpdateContactMutation_updateContact_contact_lastDonation {
  id: string;
  paymentMethod: string | null;
  amount: UpdateContactMutation_updateContact_contact_lastDonation_amount;
}

export interface UpdateContactMutation_updateContact_contact_contactReferralsToMe_nodes_referredBy {
  id: string;
  name: string;
}

export interface UpdateContactMutation_updateContact_contact_contactReferralsToMe_nodes {
  id: string;
  referredBy: UpdateContactMutation_updateContact_contact_contactReferralsToMe_nodes_referredBy;
}

export interface UpdateContactMutation_updateContact_contact_contactReferralsToMe {
  /**
   * A list of nodes.
   */
  nodes: (UpdateContactMutation_updateContact_contact_contactReferralsToMe_nodes | null)[] | null;
}

export interface UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes_donorAccount_organization {
  id: string;
  name: string;
}

export interface UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes_donorAccount {
  id: string;
  accountNumber: string;
  organization: UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes_donorAccount_organization;
}

export interface UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes {
  id: string;
  donorAccount: UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes_donorAccount;
}

export interface UpdateContactMutation_updateContact_contact_contactDonorAccounts {
  /**
   * A list of nodes.
   */
  nodes: (UpdateContactMutation_updateContact_contact_contactDonorAccounts_nodes | null)[] | null;
}

export interface UpdateContactMutation_updateContact_contact {
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
  user: UpdateContactMutation_updateContact_contact_user | null;
  primaryPerson: UpdateContactMutation_updateContact_contact_primaryPerson | null;
  primaryAddress: UpdateContactMutation_updateContact_contact_primaryAddress | null;
  lastDonation: UpdateContactMutation_updateContact_contact_lastDonation | null;
  likelyToGive: LikelyToGiveEnum | null;
  totalDonations: number | null;
  envelopeGreeting: string | null;
  greeting: string | null;
  contactReferralsToMe: UpdateContactMutation_updateContact_contact_contactReferralsToMe;
  noAppeals: boolean | null;
  preferredContactMethod: PreferredContactMethodEnum | null;
  locale: string | null;
  timezone: string | null;
  churchName: string | null;
  nextAsk: any | null;
  website: string | null;
  contactDonorAccounts: UpdateContactMutation_updateContact_contact_contactDonorAccounts;
  notes: string | null;
  source: ContactSourceEnum | null;
}

export interface UpdateContactMutation_updateContact {
  contact: UpdateContactMutation_updateContact_contact;
}

export interface UpdateContactMutation {
  updateContact: UpdateContactMutation_updateContact | null;
}

export interface UpdateContactMutationVariables {
  accountListId: string;
  attributes: ContactUpdateInput;
}
