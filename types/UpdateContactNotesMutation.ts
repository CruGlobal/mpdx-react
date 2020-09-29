/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ContactUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateContactNotesMutation
// ====================================================

export interface UpdateContactNotesMutation_updateContact_contact {
  id: string;
  notes: string | null;
  updatedAt: any;
}

export interface UpdateContactNotesMutation_updateContact {
  contact: UpdateContactNotesMutation_updateContact_contact;
}

export interface UpdateContactNotesMutation {
  updateContact: UpdateContactNotesMutation_updateContact | null;
}

export interface UpdateContactNotesMutationVariables {
  accountListId: string;
  attributes: ContactUpdateInput;
}
