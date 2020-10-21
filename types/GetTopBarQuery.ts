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

export interface GetTopBarQuery_user_keyAccounts {
  id: string;
  email: string;
}

export interface GetTopBarQuery_user_administrativeOrganizations_nodes {
  id: string;
}

export interface GetTopBarQuery_user_administrativeOrganizations {
  /**
   * A list of nodes.
   */
  nodes: (GetTopBarQuery_user_administrativeOrganizations_nodes | null)[] | null;
}

export interface GetTopBarQuery_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
  admin: boolean;
  developer: boolean;
  /**
   * Key Accounts used to authenticate this user
   */
  keyAccounts: GetTopBarQuery_user_keyAccounts[];
  administrativeOrganizations: GetTopBarQuery_user_administrativeOrganizations;
}

export interface GetTopBarQuery {
  /**
   * All current user AccountLists
   */
  accountLists: GetTopBarQuery_accountLists;
  /**
   * Current User
   */
  user: GetTopBarQuery_user;
}
