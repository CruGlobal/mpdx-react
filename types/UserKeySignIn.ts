/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserKeySignIn
// ====================================================

export interface UserKeySignIn_userKeySignIn_user {
  id: string;
  name: string | null;
}

export interface UserKeySignIn_userKeySignIn {
  token: string | null;
  user: UserKeySignIn_userKeySignIn_user | null;
}

export interface UserKeySignIn {
  userKeySignIn: UserKeySignIn_userKeySignIn | null;
}

export interface UserKeySignInVariables {
  ticket?: string | null;
}
