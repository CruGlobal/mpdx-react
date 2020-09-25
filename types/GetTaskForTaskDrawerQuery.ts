/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTaskForTaskDrawerQuery
// ====================================================

export interface GetTaskForTaskDrawerQuery_task_contacts_nodes {
  id: string;
  name: string;
}

export interface GetTaskForTaskDrawerQuery_task_contacts {
  /**
   * A list of nodes.
   */
  nodes: (GetTaskForTaskDrawerQuery_task_contacts_nodes | null)[] | null;
}

export interface GetTaskForTaskDrawerQuery_task_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface GetTaskForTaskDrawerQuery_task {
  id: string;
  activityType: ActivityTypeEnum | null;
  subject: string;
  startAt: any | null;
  completedAt: any | null;
  tagList: string[];
  contacts: GetTaskForTaskDrawerQuery_task_contacts;
  user: GetTaskForTaskDrawerQuery_task_user | null;
  notificationTimeBefore: number | null;
  notificationType: NotificationTypeEnum | null;
  notificationTimeUnit: NotificationTimeUnitEnum | null;
}

export interface GetTaskForTaskDrawerQuery {
  /**
   * Task with a given ID
   */
  task: GetTaskForTaskDrawerQuery_task;
}

export interface GetTaskForTaskDrawerQueryVariables {
  accountListId: string;
  taskId: string;
}
