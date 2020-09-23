/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SendNewsletterEnum, StatusEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetContactForTaskDetailsQuery
// ====================================================

export interface GetContactForTaskDetailsQuery_contact_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetContactForTaskDetailsQuery_contact {
  id: string;
  name: string;
  sendNewsletter: SendNewsletterEnum | null;
  status: StatusEnum | null;
  tagList: string[];
  user: GetContactForTaskDetailsQuery_contact_user | null;
}

export interface GetContactForTaskDetailsQuery {
  /**
   * Contact with a given ID
   */
  contact: GetContactForTaskDetailsQuery_contact;
}

export interface GetContactForTaskDetailsQueryVariables {
  accountListId: string;
  contactId: string;
}
