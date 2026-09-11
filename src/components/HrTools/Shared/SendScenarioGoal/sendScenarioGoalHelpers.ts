import { TFunction } from 'react-i18next';

/** The fields the API's `:send` validation context needs, plus the addresses it sends to. */
export interface SendableScenarioGoal {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  geographicLocation?: string | null;
  /** An Int once saved, the Select's string while editing. */
  calculationsYear?: number | string | null;
  emailAddress?: string | null;
  spouseEmailAddress?: string | null;
}

/** Mirrors the API's `provided_email_addresses` so the confirmation can name them before sending. */
export const scenarioGoalRecipients = (
  goal: SendableScenarioGoal,
): string[] => {
  const addresses = [goal.emailAddress, goal.spouseEmailAddress]
    .map((address) => address?.trim().toLowerCase())
    .filter((address): address is string => Boolean(address));

  return [...new Set(addresses)];
};

/**
 * Why the send controls are disabled, or `null` when the worksheet can be
 * emailed. Mirrors the API's `REQUIRED_FOR_SEND` so a click never turns into a
 * server-side validation error.
 */
export const scenarioGoalSendBlockedReason = (
  goal: SendableScenarioGoal,
  t: TFunction,
): string | null => {
  const required = [
    goal.firstName,
    goal.lastName,
    goal.geographicLocation,
    goal.calculationsYear,
  ];
  // Editing form values arrive as '' rather than null while still unset.
  const isBlank = (value: (typeof required)[number]) =>
    value === null || value === undefined || value === '';

  if (required.some(isBlank)) {
    return t(
      'A first name, last name, campus division, and year are required before the worksheet can be emailed.',
    );
  }

  if (!scenarioGoalRecipients(goal).length) {
    return t(
      'This scenario goal has no email address to send the worksheet to.',
    );
  }

  return null;
};
