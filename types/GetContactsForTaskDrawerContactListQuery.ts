/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StatusEnum, SendNewsletterEnum, PledgeFrequencyEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetContactsForTaskDrawerContactListQuery
// ====================================================

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryAddress {
  id: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  location: string | null;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson_primaryEmailAddress {
  id: string;
  email: string;
  location: string | null;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson_primaryPhoneNumber {
  id: string;
  number: string;
  location: string | null;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson {
  id: string;
  title: string | null;
  firstName: string | null;
  lastName: string | null;
  suffix: string | null;
  primaryEmailAddress: GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson_primaryEmailAddress | null;
  primaryPhoneNumber: GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson_primaryPhoneNumber | null;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_lastDonation_amount {
  amount: number;
  currency: string;
  conversionDate: any;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes_lastDonation {
  id: string;
  amount: GetContactsForTaskDrawerContactListQuery_contacts_nodes_lastDonation_amount;
}

export interface GetContactsForTaskDrawerContactListQuery_contacts_nodes {
  id: string;
  name: string;
  primaryAddress: GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryAddress | null;
  primaryPerson: GetContactsForTaskDrawerContactListQuery_contacts_nodes_primaryPerson | null;
  status: StatusEnum | null;
  sendNewsletter: SendNewsletterEnum | null;
  lastDonation: GetContactsForTaskDrawerContactListQuery_contacts_nodes_lastDonation | null;
  pledgeAmount: number | null;
  pledgeCurrency: string | null;
  pledgeFrequency: PledgeFrequencyEnum | null;
  tagList: string[];
}

export interface GetContactsForTaskDrawerContactListQuery_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetContactsForTaskDrawerContactListQuery_contacts_nodes | null)[] | null;
}

export interface GetContactsForTaskDrawerContactListQuery {
  /**
   * Contacts belonging to an AccountList
   */
  contacts: GetContactsForTaskDrawerContactListQuery_contacts;
}

export interface GetContactsForTaskDrawerContactListQueryVariables {
  accountListId: string;
  contactIds?: string[] | null;
}
