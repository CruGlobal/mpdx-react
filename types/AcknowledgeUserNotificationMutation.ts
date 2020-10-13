/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AcknowledgeUserNotificationMutation
// ====================================================

export interface AcknowledgeUserNotificationMutation_acknowledgeUserNotification_notification {
  id: string;
  read: boolean;
}

export interface AcknowledgeUserNotificationMutation_acknowledgeUserNotification {
  notification: AcknowledgeUserNotificationMutation_acknowledgeUserNotification_notification;
}

export interface AcknowledgeUserNotificationMutation {
  acknowledgeUserNotification: AcknowledgeUserNotificationMutation_acknowledgeUserNotification | null;
}

export interface AcknowledgeUserNotificationMutationVariables {
  notificationId: string;
}
