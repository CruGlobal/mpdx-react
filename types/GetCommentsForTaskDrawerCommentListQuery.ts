/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCommentsForTaskDrawerCommentListQuery
// ====================================================

export interface GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes_person {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes {
  id: string;
  body: string;
  createdAt: any;
  me: boolean;
  person: GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes_person;
}

export interface GetCommentsForTaskDrawerCommentListQuery_task_comments {
  /**
   * A list of nodes.
   */
  nodes: (GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes | null)[] | null;
}

export interface GetCommentsForTaskDrawerCommentListQuery_task {
  comments: GetCommentsForTaskDrawerCommentListQuery_task_comments;
}

export interface GetCommentsForTaskDrawerCommentListQuery {
  /**
   * Task with a given ID
   */
  task: GetCommentsForTaskDrawerCommentListQuery_task;
}

export interface GetCommentsForTaskDrawerCommentListQueryVariables {
  accountListId: string;
  taskId: string;
}
