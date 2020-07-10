/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetWeeklyActivityQuery
// ====================================================

export interface GetWeeklyActivityQuery_completedCalls {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery_callsThatProducedAppointments {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery_completedMessages {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery_messagesThatProducedAppointments {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery_completedAppointments {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery_completedCorrespondence {
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
}

export interface GetWeeklyActivityQuery {
  /**
   * Tasks Belonging to an AccountList
   */
  completedCalls: GetWeeklyActivityQuery_completedCalls;
  /**
   * Tasks Belonging to an AccountList
   */
  callsThatProducedAppointments: GetWeeklyActivityQuery_callsThatProducedAppointments;
  /**
   * Tasks Belonging to an AccountList
   */
  completedMessages: GetWeeklyActivityQuery_completedMessages;
  /**
   * Tasks Belonging to an AccountList
   */
  messagesThatProducedAppointments: GetWeeklyActivityQuery_messagesThatProducedAppointments;
  /**
   * Tasks Belonging to an AccountList
   */
  completedAppointments: GetWeeklyActivityQuery_completedAppointments;
  /**
   * Tasks Belonging to an AccountList
   */
  completedCorrespondence: GetWeeklyActivityQuery_completedCorrespondence;
}

export interface GetWeeklyActivityQueryVariables {
  accountListId: string;
  startOfWeek: any;
  endOfWeek: any;
}
