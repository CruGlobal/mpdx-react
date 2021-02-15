/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {
  TaskCreateInput,
  ActivityTypeEnum,
  NotificationTypeEnum,
  NotificationTimeUnitEnum,
} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CreateTaskMutation
// ====================================================

export interface CreateTaskMutation_createTask_task_contacts_nodes {
  id: string;
  name: string;
}

export interface CreateTaskMutation_createTask_task_contacts {
  /**
   * A list of nodes.
   */
  nodes: (CreateTaskMutation_createTask_task_contacts_nodes | null)[] | null;
}

export interface CreateTaskMutation_createTask_task_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface CreateTaskMutation_createTask_task {
  id: string;
  activityType: ActivityTypeEnum | null;
  subject: string;
  startAt: any | null;
  completedAt: any | null;
  tagList: string[];
  contacts: CreateTaskMutation_createTask_task_contacts;
  user: CreateTaskMutation_createTask_task_user | null;
  notificationTimeBefore: number | null;
  notificationType: NotificationTypeEnum | null;
  notificationTimeUnit: NotificationTimeUnitEnum | null;
}

export interface CreateTaskMutation_createTask {
  task: CreateTaskMutation_createTask_task;
}

export interface CreateTaskMutation {
  createTask: CreateTaskMutation_createTask | null;
}

export interface CreateTaskMutationVariables {
  accountListId: string;
  attributes: TaskCreateInput;
}
