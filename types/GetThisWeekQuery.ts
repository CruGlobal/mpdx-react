/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ActivityTypeEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetThisWeekQuery
// ====================================================

export interface GetThisWeekQuery_accountList_primaryAppeal {
  id: string;
  name: string | null;
  amount: number | null;
  pledgesAmountTotal: number;
  pledgesAmountProcessed: number;
  amountCurrency: string;
}

export interface GetThisWeekQuery_accountList {
  id: string;
  primaryAppeal: GetThisWeekQuery_accountList_primaryAppeal | null;
}

export interface GetThisWeekQuery_dueTasks_nodes_contacts_nodes {
  name: string;
}

export interface GetThisWeekQuery_dueTasks_nodes_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_dueTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetThisWeekQuery_dueTasks_nodes {
  id: string;
  subject: string;
  activityType: ActivityTypeEnum | null;
  contacts: GetThisWeekQuery_dueTasks_nodes_contacts;
}

export interface GetThisWeekQuery_dueTasks {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_dueTasks_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetThisWeekQuery_prayerRequestTasks_nodes_contacts_nodes {
  name: string;
}

export interface GetThisWeekQuery_prayerRequestTasks_nodes_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_prayerRequestTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetThisWeekQuery_prayerRequestTasks_nodes {
  id: string;
  subject: string;
  activityType: ActivityTypeEnum | null;
  contacts: GetThisWeekQuery_prayerRequestTasks_nodes_contacts;
}

export interface GetThisWeekQuery_prayerRequestTasks {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_prayerRequestTasks_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetThisWeekQuery_latePledgeContacts_nodes {
  id: string;
  name: string;
  lateAt: any | null;
}

export interface GetThisWeekQuery_latePledgeContacts {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_latePledgeContacts_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetThisWeekQuery_reportsPeopleWithBirthdays_periods_people_parentContact {
  id: string;
}

export interface GetThisWeekQuery_reportsPeopleWithBirthdays_periods_people {
  id: string;
  birthdayDay: number | null;
  birthdayMonth: number | null;
  firstName: string | null;
  lastName: string | null;
  parentContact: GetThisWeekQuery_reportsPeopleWithBirthdays_periods_people_parentContact;
}

export interface GetThisWeekQuery_reportsPeopleWithBirthdays_periods {
  people: GetThisWeekQuery_reportsPeopleWithBirthdays_periods_people[];
}

export interface GetThisWeekQuery_reportsPeopleWithBirthdays {
  periods: GetThisWeekQuery_reportsPeopleWithBirthdays_periods[];
}

export interface GetThisWeekQuery_reportsPeopleWithAnniversaries_periods_people_parentContact {
  id: string;
  name: string;
}

export interface GetThisWeekQuery_reportsPeopleWithAnniversaries_periods_people {
  id: string;
  anniversaryDay: number | null;
  anniversaryMonth: number | null;
  parentContact: GetThisWeekQuery_reportsPeopleWithAnniversaries_periods_people_parentContact;
}

export interface GetThisWeekQuery_reportsPeopleWithAnniversaries_periods {
  people: GetThisWeekQuery_reportsPeopleWithAnniversaries_periods_people[];
}

export interface GetThisWeekQuery_reportsPeopleWithAnniversaries {
  periods: GetThisWeekQuery_reportsPeopleWithAnniversaries_periods[];
}

export interface GetThisWeekQuery_recentReferrals_nodes {
  id: string;
  name: string;
}

export interface GetThisWeekQuery_recentReferrals {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_recentReferrals_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetThisWeekQuery_onHandReferrals_nodes {
  id: string;
  name: string;
}

export interface GetThisWeekQuery_onHandReferrals {
  /**
   * A list of nodes.
   */
  nodes: (GetThisWeekQuery_onHandReferrals_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetThisWeekQuery {
  /**
   * AccountList with a given ID
   */
  accountList: GetThisWeekQuery_accountList;
  /**
   * Tasks belonging to an AccountList
   */
  dueTasks: GetThisWeekQuery_dueTasks;
  /**
   * Tasks belonging to an AccountList
   */
  prayerRequestTasks: GetThisWeekQuery_prayerRequestTasks;
  /**
   * Contacts belonging to an AccountList
   */
  latePledgeContacts: GetThisWeekQuery_latePledgeContacts;
  /**
   * People associated with AccountList with a birthday in the related periods
   */
  reportsPeopleWithBirthdays: GetThisWeekQuery_reportsPeopleWithBirthdays;
  /**
   * People associated with AccountList with an anniversary in the related periods
   */
  reportsPeopleWithAnniversaries: GetThisWeekQuery_reportsPeopleWithAnniversaries;
  /**
   * Contacts belonging to an AccountList
   */
  recentReferrals: GetThisWeekQuery_recentReferrals;
  /**
   * Contacts belonging to an AccountList
   */
  onHandReferrals: GetThisWeekQuery_onHandReferrals;
}

export interface GetThisWeekQueryVariables {
  accountListId: string;
  endOfDay: any;
  today: any;
  twoWeeksFromNow: any;
  twoWeeksAgo: any;
}
