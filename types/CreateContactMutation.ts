/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ContactCreateInput, SendNewsletterEnum, StatusEnum, PledgeFrequencyEnum, LikelyToGiveEnum, PreferredContactMethodEnum, ContactSourceEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateContactMutation
// ====================================================

export interface CreateContactMutation_createContact_contact_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface CreateContactMutation_createContact_contact_primaryPerson_primaryEmailAddress {
  id: string;
  email: string;
  location: string | null;
}

export interface CreateContactMutation_createContact_contact_primaryPerson_primaryPhoneNumber {
  id: string;
  number: string;
  location: string | null;
}

export interface CreateContactMutation_createContact_contact_primaryPerson {
  id: string;
  primaryEmailAddress: CreateContactMutation_createContact_contact_primaryPerson_primaryEmailAddress | null;
  primaryPhoneNumber: CreateContactMutation_createContact_contact_primaryPerson_primaryPhoneNumber | null;
}

export interface CreateContactMutation_createContact_contact_primaryAddress {
  id: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  location: string | null;
}

export interface CreateContactMutation_createContact_contact_lastDonation_amount {
  amount: number;
  currency: string;
  conversionDate: any;
}

export interface CreateContactMutation_createContact_contact_lastDonation {
  id: string;
  paymentMethod: string | null;
  amount: CreateContactMutation_createContact_contact_lastDonation_amount;
}

export interface CreateContactMutation_createContact_contact_contactReferralsToMe_nodes_referredBy {
  id: string;
  name: string;
}

export interface CreateContactMutation_createContact_contact_contactReferralsToMe_nodes {
  id: string;
  referredBy: CreateContactMutation_createContact_contact_contactReferralsToMe_nodes_referredBy;
}

export interface CreateContactMutation_createContact_contact_contactReferralsToMe {
  /**
   * A list of nodes.
   */
  nodes: (CreateContactMutation_createContact_contact_contactReferralsToMe_nodes | null)[] | null;
}

export interface CreateContactMutation_createContact_contact_contactDonorAccounts_nodes_donorAccount_organization {
  id: string;
  name: string;
}

export interface CreateContactMutation_createContact_contact_contactDonorAccounts_nodes_donorAccount {
  id: string;
  accountNumber: string;
  organization: CreateContactMutation_createContact_contact_contactDonorAccounts_nodes_donorAccount_organization;
}

export interface CreateContactMutation_createContact_contact_contactDonorAccounts_nodes {
  id: string;
  donorAccount: CreateContactMutation_createContact_contact_contactDonorAccounts_nodes_donorAccount;
}

export interface CreateContactMutation_createContact_contact_contactDonorAccounts {
  /**
   * A list of nodes.
   */
  nodes: (CreateContactMutation_createContact_contact_contactDonorAccounts_nodes | null)[] | null;
}

export interface CreateContactMutation_createContact_contact {
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
  user: CreateContactMutation_createContact_contact_user | null;
  primaryPerson: CreateContactMutation_createContact_contact_primaryPerson | null;
  primaryAddress: CreateContactMutation_createContact_contact_primaryAddress | null;
  lastDonation: CreateContactMutation_createContact_contact_lastDonation | null;
  likelyToGive: LikelyToGiveEnum | null;
  totalDonations: number | null;
  envelopeGreeting: string | null;
  greeting: string | null;
  contactReferralsToMe: CreateContactMutation_createContact_contact_contactReferralsToMe;
  noAppeals: boolean | null;
  preferredContactMethod: PreferredContactMethodEnum | null;
  locale: string | null;
  timezone: string | null;
  churchName: string | null;
  nextAsk: any | null;
  website: string | null;
  contactDonorAccounts: CreateContactMutation_createContact_contact_contactDonorAccounts;
  notes: string | null;
  source: ContactSourceEnum | null;
}

export interface CreateContactMutation_createContact {
  contact: CreateContactMutation_createContact_contact;
}

export interface CreateContactMutation {
  createContact: CreateContactMutation_createContact | null;
}

export interface CreateContactMutationVariables {
  accountListId: string;
  attributes: ContactCreateInput;
}
