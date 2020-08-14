/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDashboardQuery
// ====================================================

export interface GetDashboardQuery_user {
  firstName: string | null;
}

export interface GetDashboardQuery_accountList {
  name: string | null;
  monthlyGoal: number | null;
  receivedPledges: number;
  totalPledges: number;
  currency: string;
  balance: number;
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

export interface GetDashboardQuery {
  /**
   * Current User
   */
  user: GetDashboardQuery_user;
  /**
   * AccountList with a given ID
   */
  accountList: GetDashboardQuery_accountList;
  /**
   * Donations received by AccountList in the related periods
   */
  reportsDonationHistories: GetDashboardQuery_reportsDonationHistories;
}

export interface GetDashboardQueryVariables {
  accountListId: string;
}
