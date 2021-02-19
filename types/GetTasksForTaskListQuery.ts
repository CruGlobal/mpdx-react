/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ActivityTypeEnum, DateTimeRangeInput } from './globalTypes';

// ====================================================
// GraphQL query operation: GetTasksForTaskListQuery
// ====================================================

export interface GetTasksForTaskListQuery_tasks_nodes_contacts_nodes {
  id: string;
  name: string;
}

export interface GetTasksForTaskListQuery_tasks_nodes_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetTasksForTaskListQuery_tasks_nodes_contacts_nodes | null)[] | null;
}

export interface GetTasksForTaskListQuery_tasks_nodes_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetTasksForTaskListQuery_tasks_nodes {
  id: string;
  activityType: ActivityTypeEnum | null;
  subject: string;
  startAt: any | null;
  completedAt: any | null;
  tagList: string[];
  contacts: GetTasksForTaskListQuery_tasks_nodes_contacts;
  user: GetTasksForTaskListQuery_tasks_nodes_user | null;
}

export interface GetTasksForTaskListQuery_tasks_pageInfo {
  /**
   * When paginating backwards, the cursor to continue.
   */
  startCursor: string | null;
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
}

export interface GetTasksForTaskListQuery_tasks {
  /**
   * A list of nodes.
   */
  nodes: (GetTasksForTaskListQuery_tasks_nodes | null)[] | null;
  /**
   * Total # of objects returned from this Plural Query
   */
  totalCount: number;
  /**
   * Information to aid in pagination.
   */
  pageInfo: GetTasksForTaskListQuery_tasks_pageInfo;
}

export interface GetTasksForTaskListQuery {
  /**
   * Tasks belonging to an AccountList
   */
  tasks: GetTasksForTaskListQuery_tasks;
}

export interface GetTasksForTaskListQueryVariables {
  accountListId: string;
  first?: number | null;
  before?: string | null;
  after?: string | null;
  activityType?: ActivityTypeEnum[] | null;
  contactIds?: string[] | null;
  userIds?: string[] | null;
  tags?: string[] | null;
  completed?: boolean | null;
  wildcardSearch?: string | null;
  startAt?: DateTimeRangeInput | null;
}
