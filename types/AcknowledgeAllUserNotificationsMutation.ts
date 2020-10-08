/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AcknowledgeAllUserNotificationsMutation
// ====================================================

export interface AcknowledgeAllUserNotificationsMutation_acknowledgeAllUserNotifications {
  notificationIds: string[];
}

export interface AcknowledgeAllUserNotificationsMutation {
  acknowledgeAllUserNotifications: AcknowledgeAllUserNotificationsMutation_acknowledgeAllUserNotifications | null;
}

export interface AcknowledgeAllUserNotificationsMutationVariables {
  accountListId: string;
}
