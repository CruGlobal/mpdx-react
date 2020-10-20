/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSideBarQuery
// ====================================================

export interface GetSideBarQuery_contactsFixCommitmentInfo {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_contactsFixMailingAddress {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_contactsFixSendNewsletter {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_peopleFixEmailAddress {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_peopleFixPhoneNumber {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_contactDuplicates {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery_personDuplicates {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetSideBarQuery {
  /**
   * Contacts belonging to an AccountList
   */
  contactsFixCommitmentInfo: GetSideBarQuery_contactsFixCommitmentInfo;
  /**
   * Contacts belonging to an AccountList
   */
  contactsFixMailingAddress: GetSideBarQuery_contactsFixMailingAddress;
  /**
   * Contacts belonging to an AccountList
   */
  contactsFixSendNewsletter: GetSideBarQuery_contactsFixSendNewsletter;
  /**
   * People belonging to an AccountList
   */
  peopleFixEmailAddress: GetSideBarQuery_peopleFixEmailAddress;
  /**
   * People belonging to an AccountList
   */
  peopleFixPhoneNumber: GetSideBarQuery_peopleFixPhoneNumber;
  /**
   * Contact duplicates belonging to an AccountList
   */
  contactDuplicates: GetSideBarQuery_contactDuplicates;
  /**
   * Person duplicates belonging to an AccountList
   */
  personDuplicates: GetSideBarQuery_personDuplicates;
}

export interface GetSideBarQueryVariables {
  accountListId: string;
}
