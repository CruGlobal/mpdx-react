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

export enum NotificationTypeTypeEnum {
  CALL_PARTNER_ONCE_PER_YEAR = "CALL_PARTNER_ONCE_PER_YEAR",
  LARGER_GIFT = "LARGER_GIFT",
  LONG_TIME_FRAME_GIFT = "LONG_TIME_FRAME_GIFT",
  MISSING_ADDRESS_IN_NEWSLETTER = "MISSING_ADDRESS_IN_NEWSLETTER",
  MISSING_EMAIL_IN_NEWSLETTER = "MISSING_EMAIL_IN_NEWSLETTER",
  NEW_DESIGNATION_ACCOUNT_SUBSCRIPTION = "NEW_DESIGNATION_ACCOUNT_SUBSCRIPTION",
  NEW_PAGE_SUBSCRIPTION = "NEW_PAGE_SUBSCRIPTION",
  NEW_PARTNER_DUPLICATE_MERGED = "NEW_PARTNER_DUPLICATE_MERGED",
  NEW_PARTNER_DUPLICATE_NOT_MERGED = "NEW_PARTNER_DUPLICATE_NOT_MERGED",
  NEW_PARTNER_NO_DUPLICATE = "NEW_PARTNER_NO_DUPLICATE",
  RECONTINUING_GIFT = "RECONTINUING_GIFT",
  REMIND_PARTNER_IN_ADVANCE = "REMIND_PARTNER_IN_ADVANCE",
  SMALLER_GIFT = "SMALLER_GIFT",
  SPECIAL_GIFT = "SPECIAL_GIFT",
  STARTED_GIVING = "STARTED_GIVING",
  STOPPED_GIVING = "STOPPED_GIVING",
  THANK_PARTNER_ONCE_PER_YEAR = "THANK_PARTNER_ONCE_PER_YEAR",
  UPCOMING_ANNIVERSARY = "UPCOMING_ANNIVERSARY",
  UPCOMING_BIRTHDAY = "UPCOMING_BIRTHDAY",
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

/**
 * Range of dates
 */
export interface DateTimeRangeInput {
  min?: any | null;
  max?: any | null;
}

export interface TaskCommentCreateInput {
  id?: string | null;
  body: string;
}

export interface TaskCreateInput {
  id?: string | null;
  subject: string;
  activityType?: ActivityTypeEnum | null;
  result?: ResultEnum | null;
  nextAction?: ActivityTypeEnum | null;
  completedAt?: any | null;
  startAt?: any | null;
  contactIds?: string[] | null;
  notificationType?: NotificationTypeEnum | null;
  notificationTimeBefore?: number | null;
  notificationTimeUnit?: NotificationTimeUnitEnum | null;
  userId?: string | null;
  tagList?: string[] | null;
}

export interface TaskUpdateInput {
  id?: string | null;
  subject?: string | null;
  activityType?: ActivityTypeEnum | null;
  result?: ResultEnum | null;
  nextAction?: ActivityTypeEnum | null;
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
