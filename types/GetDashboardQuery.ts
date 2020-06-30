/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ActivityTypeEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetDashboardQuery
// ====================================================

export interface GetDashboardQuery_user {
  __typename: "User";
  firstName: string | null;
}

export interface GetDashboardQuery_accountList {
  __typename: "AccountList";
  monthlyGoal: number | null;
  receivedPledges: number | null;
  committed: number | null;
  currency: string | null;
  balance: number | null;
}

export interface GetDashboardQuery_reportsDonationHistories_periods_totals {
  __typename: "Total";
  currency: string;
  /**
   * donation total converted half-way through period
   */
  convertedAmount: number;
}

export interface GetDashboardQuery_reportsDonationHistories_periods {
  __typename: "DonationHistoriesPeriod";
  startDate: any;
  convertedTotal: number;
  totals: GetDashboardQuery_reportsDonationHistories_periods_totals[];
}

export interface GetDashboardQuery_reportsDonationHistories {
  __typename: "DonationHistories";
  /**
   * total divided by number of periods except current period
   */
  averageIgnoreCurrent: number;
  periods: GetDashboardQuery_reportsDonationHistories_periods[];
}

export interface GetDashboardQuery_dueTasks_nodes_contacts_nodes {
  __typename: "Contact";
  name: string;
}

export interface GetDashboardQuery_dueTasks_nodes_contacts {
  __typename: "ContactConnection";
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_dueTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetDashboardQuery_dueTasks_nodes {
  __typename: "Task";
  id: string;
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  contacts: GetDashboardQuery_dueTasks_nodes_contacts;
}

export interface GetDashboardQuery_dueTasks {
  __typename: "TaskConnection";
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
  __typename: "Contact";
  name: string;
}

export interface GetDashboardQuery_prayerRequestTasks_nodes_contacts {
  __typename: "ContactConnection";
  /**
   * A list of nodes.
   */
  nodes: (GetDashboardQuery_prayerRequestTasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetDashboardQuery_prayerRequestTasks_nodes {
  __typename: "Task";
  id: string;
  subject: string | null;
  activityType: ActivityTypeEnum | null;
  contacts: GetDashboardQuery_prayerRequestTasks_nodes_contacts;
}

export interface GetDashboardQuery_prayerRequestTasks {
  __typename: "TaskConnection";
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
  __typename: "Contact";
  id: string;
  name: string;
  lateAt: any | null;
}

export interface GetDashboardQuery_latePledgeContacts {
  __typename: "ContactConnection";
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
  __typename: "Contact";
  id: string;
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays_periods_people {
  __typename: "PersonWithParentContact";
  id: string;
  birthdayDay: number | null;
  birthdayMonth: number | null;
  firstName: string | null;
  lastName: string | null;
  parentContact: GetDashboardQuery_reportsPeopleWithBirthdays_periods_people_parentContact;
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays_periods {
  __typename: "PeoplePeriod";
  people: GetDashboardQuery_reportsPeopleWithBirthdays_periods_people[];
}

export interface GetDashboardQuery_reportsPeopleWithBirthdays {
  __typename: "People";
  periods: GetDashboardQuery_reportsPeopleWithBirthdays_periods[];
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people_parentContact {
  __typename: "Contact";
  id: string;
  name: string;
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people {
  __typename: "PersonWithParentContact";
  id: string;
  anniversaryDay: number | null;
  anniversaryMonth: number | null;
  parentContact: GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people_parentContact;
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries_periods {
  __typename: "PeoplePeriod";
  people: GetDashboardQuery_reportsPeopleWithAnniversaries_periods_people[];
}

export interface GetDashboardQuery_reportsPeopleWithAnniversaries {
  __typename: "People";
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
