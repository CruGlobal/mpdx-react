/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskInput, ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CreateTaskMutation
// ====================================================

export interface CreateTaskMutation_createTask_task_user {
  id: string;
}

export interface CreateTaskMutation_createTask_task_contacts_nodes {
  id: string;
}

export interface CreateTaskMutation_createTask_task_contacts {
  /**
   * A list of nodes.
   */
  nodes: (CreateTaskMutation_createTask_task_contacts_nodes | null)[] | null;
}

export interface CreateTaskMutation_createTask_task {
  id: string;
  activityType: ActivityTypeEnum | null;
  subject: string | null;
  startAt: any | null;
  tagList: string[];
  notificationTimeBefore: number | null;
  notificationType: NotificationTypeEnum | null;
  notificationTimeUnit: NotificationTimeUnitEnum | null;
  user: CreateTaskMutation_createTask_task_user | null;
  contacts: CreateTaskMutation_createTask_task_contacts;
}

export interface CreateTaskMutation_createTask {
  task: CreateTaskMutation_createTask_task;
}

export interface CreateTaskMutation {
  createTask: CreateTaskMutation_createTask | null;
}

export interface CreateTaskMutationVariables {
  accountListId: string;
  attributes: TaskInput;
}
