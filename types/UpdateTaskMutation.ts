/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskInput, ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UpdateTaskMutation
// ====================================================

export interface UpdateTaskMutation_updateTask_task_contacts_nodes {
  id: string;
  name: string;
}

export interface UpdateTaskMutation_updateTask_task_contacts {
  /**
   * A list of nodes.
   */
  nodes: (UpdateTaskMutation_updateTask_task_contacts_nodes | null)[] | null;
}

export interface UpdateTaskMutation_updateTask_task_user {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface UpdateTaskMutation_updateTask_task {
  id: string;
  activityType: ActivityTypeEnum | null;
  subject: string | null;
  startAt: any | null;
  tagList: string[];
  contacts: UpdateTaskMutation_updateTask_task_contacts;
  user: UpdateTaskMutation_updateTask_task_user | null;
  notificationTimeBefore: number | null;
  notificationType: NotificationTypeEnum | null;
  notificationTimeUnit: NotificationTimeUnitEnum | null;
}

export interface UpdateTaskMutation_updateTask {
  task: UpdateTaskMutation_updateTask_task;
}

export interface UpdateTaskMutation {
  updateTask: UpdateTaskMutation_updateTask | null;
}

export interface UpdateTaskMutationVariables {
  accountListId: string;
  attributes: TaskInput;
}
