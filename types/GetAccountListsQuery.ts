/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAccountListsQuery
// ====================================================

export interface GetAccountListsQuery_accountLists_nodes {
  id: string;
  name: string | null;
  monthlyGoal: number | null;
  receivedPledges: number;
  totalPledges: number;
  currency: string;
}

export interface GetAccountListsQuery_accountLists {
  /**
   * A list of nodes.
   */
  nodes: (GetAccountListsQuery_accountLists_nodes | null)[] | null;
}

export interface GetAccountListsQuery {
  /**
   * All current user AccountLists
   */
  accountLists: GetAccountListsQuery_accountLists;
}
