/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAccountListsQuery
// ====================================================

export interface GetAccountListsQuery_accountLists_nodes {
  __typename: "AccountList";
  id: string;
  name: string | null;
}

export interface GetAccountListsQuery_accountLists {
  __typename: "AccountListConnection";
  /**
   * A list of nodes.
   */
  nodes: (GetAccountListsQuery_accountLists_nodes | null)[] | null;
}

export interface GetAccountListsQuery {
  /**
   * returns all account lists associated with the current user
   */
  accountLists: GetAccountListsQuery_accountLists;
}
