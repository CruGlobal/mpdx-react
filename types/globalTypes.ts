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

export enum ContactSourceEnum {
  GIVE_SITE = "GIVE_SITE",
  MPDX = "MPDX",
}

export enum LikelyToGiveEnum {
  LEAST_LIKELY = "LEAST_LIKELY",
  LIKELY = "LIKELY",
  MOST_LIKELY = "MOST_LIKELY",
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

export enum PreferredContactMethodEnum {
  EMAIL = "EMAIL",
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
  PHONE_CALL = "PHONE_CALL",
  SMS = "SMS",
  WE_CHAT = "WE_CHAT",
  WHATS_APP = "WHATS_APP",
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

export interface ContactCreateInput {
  id?: string | null;
  name: string;
  status?: StatusEnum | null;
  sendNewsletter?: SendNewsletterEnum | null;
  pledgeReceived?: boolean | null;
  pledgeAmount?: number | null;
  pledgeCurrency?: string | null;
  pledgeFrequency?: PledgeFrequencyEnum | null;
  pledgeStartDate?: any | null;
  userId?: string | null;
  tagList?: string[] | null;
  likelyToGive?: LikelyToGiveEnum | null;
  nextAsk?: any | null;
  envelopeGreeting?: string | null;
  greeting?: string | null;
  noAppeals?: boolean | null;
  preferredContactMethod?: PreferredContactMethodEnum | null;
  locale?: string | null;
  timezone?: string | null;
  churchName?: string | null;
  website?: string | null;
  notes?: string | null;
}

export interface ContactUpdateInput {
  id: string;
  name?: string | null;
  status?: StatusEnum | null;
  sendNewsletter?: SendNewsletterEnum | null;
  pledgeReceived?: boolean | null;
  pledgeAmount?: number | null;
  pledgeCurrency?: string | null;
  pledgeFrequency?: PledgeFrequencyEnum | null;
  pledgeStartDate?: any | null;
  userId?: string | null;
  tagList?: string[] | null;
  likelyToGive?: LikelyToGiveEnum | null;
  nextAsk?: any | null;
  envelopeGreeting?: string | null;
  greeting?: string | null;
  noAppeals?: boolean | null;
  preferredContactMethod?: PreferredContactMethodEnum | null;
  locale?: string | null;
  timezone?: string | null;
  churchName?: string | null;
  website?: string | null;
  notes?: string | null;
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
