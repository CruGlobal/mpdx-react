/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetContactForContactNotesQuery
// ====================================================

export interface GetContactForContactNotesQuery_contact {
  id: string;
  notes: string | null;
  updatedAt: any;
}

export interface GetContactForContactNotesQuery {
  /**
   * Contact with a given ID
   */
  contact: GetContactForContactNotesQuery_contact;
}

export interface GetContactForContactNotesQueryVariables {
  accountListId: string;
  contactId: string;
}
