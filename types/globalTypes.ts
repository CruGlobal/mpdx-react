/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum ActivityTypeEnum {
  APPOINTMENT = "APPOINTMENT",
  CALL = "CALL",
  EMAIL = "EMAIL",
  FACEBOOK_MESSAGE = "FACEBOOK_MESSAGE",
  LETTER = "LETTER",
  NEWSLETTER_EMAIL = "NEWSLETTER_EMAIL",
  NEWSLETTER_PHYSICAL = "NEWSLETTER_PHYSICAL",
  NONE = "NONE",
  PRAYER_REQUEST = "PRAYER_REQUEST",
  PRE_CALL_LETTER = "PRE_CALL_LETTER",
  REMINDER_LETTER = "REMINDER_LETTER",
  SUPPORT_LETTER = "SUPPORT_LETTER",
  TALK_TO_IN_PERSON = "TALK_TO_IN_PERSON",
  TEXT_MESSAGE = "TEXT_MESSAGE",
  THANK = "THANK",
  TO_DO = "TO_DO",
}

export enum NextActionEnum {
  APPOINTMENT = "APPOINTMENT",
  CALL = "CALL",
  EMAIL = "EMAIL",
  FACEBOOK_MESSAGE = "FACEBOOK_MESSAGE",
  NONE = "NONE",
  PRAYER_REQUEST = "PRAYER_REQUEST",
  TALK_TO_IN_PERSON = "TALK_TO_IN_PERSON",
  TEXT_MESSAGE = "TEXT_MESSAGE",
  THANK = "THANK",
}

export enum NotificationTimeUnitEnum {
  DAYS = "DAYS",
  HOURS = "HOURS",
  MINUTES = "MINUTES",
}

export enum NotificationTypeEnum {
  BOTH = "BOTH",
  EMAIL = "EMAIL",
  MOBILE = "MOBILE",
}

export enum PledgeFrequencyEnum {
  ANNUAL = "ANNUAL",
  EVERY_2_MONTHS = "EVERY_2_MONTHS",
  EVERY_2_WEEKS = "EVERY_2_WEEKS",
  EVERY_2_YEARS = "EVERY_2_YEARS",
  EVERY_4_MONTHS = "EVERY_4_MONTHS",
  EVERY_6_MONTHS = "EVERY_6_MONTHS",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  WEEKLY = "WEEKLY",
}

export enum ResultEnum {
  ATTEMPTED = "ATTEMPTED",
  ATTEMPTED_LEFT_MESSAGE = "ATTEMPTED_LEFT_MESSAGE",
  COMPLETED = "COMPLETED",
  DONE = "DONE",
  NONE = "NONE",
  RECEIVED = "RECEIVED",
}

export enum SendNewsletterEnum {
  BOTH = "BOTH",
  EMAIL = "EMAIL",
  NONE = "NONE",
  PHYSICAL = "PHYSICAL",
}

export enum StatusEnum {
  APPOINTMENT_SCHEDULED = "APPOINTMENT_SCHEDULED",
  ASK_IN_FUTURE = "ASK_IN_FUTURE",
  CALL_FOR_DECISION = "CALL_FOR_DECISION",
  CONTACT_FOR_APPOINTMENT = "CONTACT_FOR_APPOINTMENT",
  CULTIVATE_RELATIONSHIP = "CULTIVATE_RELATIONSHIP",
  EXPIRED_REFERRAL = "EXPIRED_REFERRAL",
  NEVER_ASK = "NEVER_ASK",
  NEVER_CONTACTED = "NEVER_CONTACTED",
  NOT_INTERESTED = "NOT_INTERESTED",
  PARTNER_FINANCIAL = "PARTNER_FINANCIAL",
  PARTNER_PRAY = "PARTNER_PRAY",
  PARTNER_SPECIAL = "PARTNER_SPECIAL",
  RESEARCH_ABANDONED = "RESEARCH_ABANDONED",
  UNRESPONSIVE = "UNRESPONSIVE",
}

export interface TaskInput {
  id?: string | null;
  subject?: string | null;
  activityType?: ActivityTypeEnum | null;
  result?: ResultEnum | null;
  nextAction?: NextActionEnum | null;
  completedAt?: any | null;
  startAt?: any | null;
  contactIds?: string[] | null;
  notificationType?: NotificationTypeEnum | null;
  notificationTimeBefore?: number | null;
  notificationTimeUnit?: NotificationTimeUnitEnum | null;
  userId?: string | null;
  tagList?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
