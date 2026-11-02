import { TFunction } from 'react-i18next';

/** Mirrors the API's `MAX_EMAIL_ADDRESSES` for one send. */
export const MAX_SCENARIO_GOAL_RECIPIENTS = 10;

/** What separates one address from the next in typed or pasted text. */
export const EMAIL_ADDRESS_SEPARATOR = /[\s,;]+/;

// A port of the email_validator gem's :strict mode, which the API checks recipients with.
const atom = '[-\\p{L}\\p{N}+_!"\'#$%^&*{}/=?`|~]';
const hostLabel =
  '(?=[^.]{1,63}(?:\\.|$))(?!.*?--.*$)[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]{0,61}[\\p{L}\\p{N}])?';
const strictEmailAddress = new RegExp(
  `^${atom}(?:\\.?${atom}){0,63}@(?=.{1,255}$)(?:${hostLabel}\\.)+\\p{L}{1,64}$`,
  'iu',
);

/** The fields the API's `:send` validation context needs, plus the addresses the send dialog starts with. */
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

/** The scenario's own addresses, normalized like the API's `provided_email_addresses`, to prefill the send dialog. */
export const scenarioGoalRecipients = (
  goal: SendableScenarioGoal,
): string[] => {
  const addresses = [goal.emailAddress, goal.spouseEmailAddress]
    .map((address) => address?.trim().toLowerCase())
    .filter((address): address is string => Boolean(address));

  return [...new Set(addresses)];
};

/** Splits typed or pasted text on commas, semicolons, and whitespace into lowercased addresses. */
export const splitEmailAddresses = (text: string): string[] =>
  text
    .split(EMAIL_ADDRESS_SEPARATOR)
    .map((address) => address.toLowerCase())
    .filter(Boolean);

export const isValidEmailAddress = (address: string): boolean =>
  strictEmailAddress.test(address);

/**
 * Why the send controls are disabled, or `null` when the worksheet can be
 * emailed. Mirrors the API's `REQUIRED_FOR_SEND` so a click never turns into a
 * server-side validation error. Recipients are not checked here because they
 * are entered in the send dialog.
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
      'A first name, last name, geographic location, and year are required before the worksheet can be emailed.',
    );
  }

  return null;
};
