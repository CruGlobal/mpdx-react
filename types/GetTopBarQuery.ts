/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTopBarQuery
// ====================================================

export interface GetTopBarQuery_accountLists_nodes {
  id: string;
  name: string | null;
}

export interface GetTopBarQuery_accountLists {
  /**
   * A list of nodes.
   */
  nodes: (GetTopBarQuery_accountLists_nodes | null)[] | null;
}

export interface GetTopBarQuery_user {
  firstName: string | null;
}

export interface GetTopBarQuery {
  /**
   * returns all account lists associated with the current user
   */
  accountLists: GetTopBarQuery_accountLists;
  /**
   * Current User
   */
  user: GetTopBarQuery_user;
}
