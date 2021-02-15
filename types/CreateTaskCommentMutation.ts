/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskCommentCreateInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateTaskCommentMutation
// ====================================================

export interface CreateTaskCommentMutation_createTaskComment_comment_person {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface CreateTaskCommentMutation_createTaskComment_comment {
  id: string;
  body: string;
  createdAt: any;
  me: boolean;
  person: CreateTaskCommentMutation_createTaskComment_comment_person;
}

export interface CreateTaskCommentMutation_createTaskComment {
  comment: CreateTaskCommentMutation_createTaskComment_comment;
}

export interface CreateTaskCommentMutation {
  createTaskComment: CreateTaskCommentMutation_createTaskComment | null;
}

export interface CreateTaskCommentMutationVariables {
  accountListId: string;
  taskId: string;
  attributes: TaskCommentCreateInput;
}
