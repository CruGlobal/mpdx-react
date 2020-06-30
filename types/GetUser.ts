/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUser
// ====================================================

export interface GetUser_user {
  __typename: "User";
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetUser {
  /**
   * Current User
   */
  user: GetUser_user;
}
