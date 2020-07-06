/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNavQuery
// ====================================================

export interface GetNavQuery_accountLists_nodes {
  id: string;
  name: string | null;
}

export interface GetNavQuery_accountLists {
  /**
   * A list of nodes.
   */
  nodes: (GetNavQuery_accountLists_nodes | null)[] | null;
}

export interface GetNavQuery_user {
  firstName: string | null;
}

export interface GetNavQuery {
  /**
   * returns all account lists associated with the current user
   */
  accountLists: GetNavQuery_accountLists;
  /**
   * Current User
   */
  user: GetNavQuery_user;
}
