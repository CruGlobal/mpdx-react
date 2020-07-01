/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserQuery
// ====================================================

export interface GetUserQuery_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetUserQuery {
  /**
   * Current User
   */
  user: GetUserQuery_user;
}
