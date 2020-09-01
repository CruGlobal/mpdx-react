/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetDataForTaskDrawerQuery
// ====================================================

export interface GetDataForTaskDrawerQuery_accountList {
  taskTagList: string[];
}

export interface GetDataForTaskDrawerQuery_accountListUsers_nodes_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetDataForTaskDrawerQuery_accountListUsers_nodes {
  id: string;
  user: GetDataForTaskDrawerQuery_accountListUsers_nodes_user;
}

export interface GetDataForTaskDrawerQuery_accountListUsers {
  /**
   * A list of nodes.
   */
  nodes: (GetDataForTaskDrawerQuery_accountListUsers_nodes | null)[] | null;
}

export interface GetDataForTaskDrawerQuery_contacts_nodes {
  id: string;
  name: string;
}

export interface GetDataForTaskDrawerQuery_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetDataForTaskDrawerQuery_contacts_nodes | null)[] | null;
}

export interface GetDataForTaskDrawerQuery {
  /**
   * AccountList with a given ID
   */
  accountList: GetDataForTaskDrawerQuery_accountList;
  /**
   * AccountListUsers belonging to an AccountList
   */
  accountListUsers: GetDataForTaskDrawerQuery_accountListUsers;
  /**
   * Contacts belonging to an AccountList
   */
  contacts: GetDataForTaskDrawerQuery_contacts;
}

export interface GetDataForTaskDrawerQueryVariables {
  accountListId: string;
}
