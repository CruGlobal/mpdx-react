/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TaskUpdateInput, ResultEnum, ActivityTypeEnum } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CompleteTaskMutation
// ====================================================

export interface CompleteTaskMutation_updateTask_task {
  id: string;
  result: ResultEnum | null;
  nextAction: ActivityTypeEnum | null;
  tagList: string[];
  completedAt: any | null;
}

export interface CompleteTaskMutation_updateTask {
  task: CompleteTaskMutation_updateTask_task;
}

export interface CompleteTaskMutation {
  updateTask: CompleteTaskMutation_updateTask | null;
}

export interface CompleteTaskMutationVariables {
  accountListId: string;
  attributes: TaskUpdateInput;
}
