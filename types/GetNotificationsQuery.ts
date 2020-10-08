/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { NotificationTypeTypeEnum } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetNotificationsQuery
// ====================================================

export interface GetNotificationsQuery_userNotifications_nodes_notification_contact {
  id: string;
  name: string;
}

export interface GetNotificationsQuery_userNotifications_nodes_notification_donation_amount {
  amount: number;
  currency: string;
  conversionDate: any;
}

export interface GetNotificationsQuery_userNotifications_nodes_notification_donation {
  id: string;
  amount: GetNotificationsQuery_userNotifications_nodes_notification_donation_amount;
}

export interface GetNotificationsQuery_userNotifications_nodes_notification_notificationType {
  id: string;
  type: NotificationTypeTypeEnum;
  descriptionTemplate: string;
}

export interface GetNotificationsQuery_userNotifications_nodes_notification {
  occurredAt: any;
  contact: GetNotificationsQuery_userNotifications_nodes_notification_contact;
  donation: GetNotificationsQuery_userNotifications_nodes_notification_donation | null;
  notificationType: GetNotificationsQuery_userNotifications_nodes_notification_notificationType;
}

export interface GetNotificationsQuery_userNotifications_nodes {
  id: string;
  read: boolean;
  notification: GetNotificationsQuery_userNotifications_nodes_notification;
}

export interface GetNotificationsQuery_userNotifications_pageInfo {
  /**
   * When paginating forwards, the cursor to continue.
   */
  endCursor: string | null;
  /**
   * When paginating forwards, are there more items?
   */
  hasNextPage: boolean;
}

export interface GetNotificationsQuery_userNotifications {
  /**
   * A list of nodes.
   */
  nodes: (GetNotificationsQuery_userNotifications_nodes | null)[] | null;
  /**
   * Information to aid in pagination.
   */
  pageInfo: GetNotificationsQuery_userNotifications_pageInfo;
  unreadCount: number;
}

export interface GetNotificationsQuery {
  /**
   * Notifications to show the user
   */
  userNotifications: GetNotificationsQuery_userNotifications;
}

export interface GetNotificationsQueryVariables {
  accountListId: string;
  after?: string | null;
}
