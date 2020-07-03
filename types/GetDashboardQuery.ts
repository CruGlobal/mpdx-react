/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ActivityTypeEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDashboardQuery
// ====================================================

export interface GetDashboardQuery_user {
  firstName: string | null;
}

export interface GetDashboardQuery_accountList {
  name: string | null;
  monthlyGoal: number | null;
  receivedPledges: number | null;
  committed: number | null;
  currency: string | null;
  balance: number | null;
}

export interface GetDashboardQuery_reportsDonationHistories_periods_totals {
  currency: string;
  /**
   * donation total converted half-way through period
   */
  convertedAmount: number;
}

export interface GetDashboardQuery_reportsDonationHistories_periods {
  startDate: any;
  convertedTotal: number;
  totals: GetDashboardQuery_reportsDonationHistories_periods_totals[];
}

export interface GetDashboardQuery_reportsDonationHistories {
  /**
   * total divided by number of periods except current period
   */
  averageIgnoreCurrent: number;
  periods: GetDashboardQuery_reportsDonationHistories_periods[];
}

export interface GetDashboardQuery_dueTasks_nodes_contacts_nodes {
  name: string;
}

export interface GetDashboardQuery_dueTasks_nodes_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_dueTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetDashboardQuery_dueTasks_nodes {
  id: string;
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  contacts: GetDashboardQuery_dueTasks_nodes_contacts;
}

export interface GetDashboardQuery_dueTasks {
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_dueTasks_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetDashboardQuery_prayerRequestTasks_nodes_contacts_nodes {
  name: string;
}

export interface GetDashboardQuery_prayerRequestTasks_nodes_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_prayerRequestTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetDashboardQuery_prayerRequestTasks_nodes {
  id: string;
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  contacts: GetDashboardQuery_prayerRequestTasks_nodes_contacts;
}

export interface GetDashboardQuery_prayerRequestTasks {
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_prayerRequestTasks_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetDashboardQuery_latePledgeContacts_nodes {
  id: string;
  name: string;
  lateAt: any | null;
}

export interface GetDashboardQuery_latePledgeContacts {
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_latePledgeContacts_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays_periods_people_parentContact {
  id: string;
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays_periods_people {
  id: string;
  birthdayDay: number | null;
  birthdayMonth: number | null;
  firstName: string | null;
  lastName: string | null;
  parentContact: GetDashboardQuery_reportsPeopleWithBirthdays_periods_people_parentContact;
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays_periods {
  people: GetDashboardQuery_reportsPeopleWithBirthdays_periods_people[];
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays {
  periods: GetDashboardQuery_reportsPeopleWithBirthdays_periods[];
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people_parentContact {
  id: string;
  name: string;
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people {
  id: string;
  anniversaryDay: number | null;
  anniversaryMonth: number | null;
  parentContact: GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people_parentContact;
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods {
  people: GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people[];
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries {
  periods: GetDashboardQuery_reportsPeopleWithAnniversaries_periods[];
}

export interface GetDashboardQuery {
  /**
   * Current User
   */
  user: GetDashboardQuery_user;
  /**
   * returns a specific account_list associated with the user when given the ID
   */
  accountList: GetDashboardQuery_accountList;
  /**
   * Donations received by AccountList in the related periods
   */
  reportsDonationHistories: GetDashboardQuery_reportsDonationHistories;
  /**
   * Tasks Belonging to an AccountList
   */
  dueTasks: GetDashboardQuery_dueTasks;
  /**
   * Tasks Belonging to an AccountList
   */
  prayerRequestTasks: GetDashboardQuery_prayerRequestTasks;
  /**
   * Contacts Belonging to an AccountList
   */
  latePledgeContacts: GetDashboardQuery_latePledgeContacts;
  /**
   * People associated with AccountList with a birthday in the related periods
   */
  reportsPeopleWithBirthdays: GetDashboardQuery_reportsPeopleWithBirthdays;
  /**
   * People associated with AccountList with an anniversary in the related periods
   */
  reportsPeopleWithAnniversaries: GetDashboardQuery_reportsPeopleWithAnniversaries;
}

export interface GetDashboardQueryVariables {
  accountListId: string;
  endOfDay: any;
  today: any;
  twoWeeksFromNow: any;
}
