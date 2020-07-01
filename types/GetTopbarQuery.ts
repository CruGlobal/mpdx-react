/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTopbarQuery
// ====================================================

export interface GetTopbarQuery_accountLists_nodes {
  id: string;
  name: string | null;
}

export interface GetTopbarQuery_accountLists {
  /**
   * A list of nodes.
   */
  nodes: (GetTopbarQuery_accountLists_nodes | null)[] | null;
}

export interface GetTopbarQuery_user {
  firstName: string | null;
}

export interface GetTopbarQuery {
  /**
   * returns all account lists associated with the current user
   */
  accountLists: GetTopbarQuery_accountLists;
  /**
   * Current User
   */
  user: GetTopbarQuery_user;
  currentAccountListId: string | null;
  breadcrumb: string | null;
}
