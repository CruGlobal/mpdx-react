import { TFunction } from 'react-i18next';
import * as yup from 'yup';

const emailAddressSchema = yup.string().email().required();

/** The fields the API's `:send` validation context needs. */
export interface SendableScenarioGoal {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  geographicLocation?: string | null;
  /** An Int once saved, the Select's string while editing. */
  calculationsYear?: number | string | null;
}

/** Trims and lowercases a typed address the way the API does before sending. */
export const normalizeEmailAddress = (address: string): string =>
  address.trim().toLowerCase();

export const isValidEmailAddress = (address: string): boolean =>
  emailAddressSchema.isValidSync(address);

/**
 * Why the send controls are disabled, or `null` when the worksheet can be
 * emailed. Mirrors the API's `REQUIRED_FOR_SEND` so a click never turns into a
 * server-side validation error. The recipient is not checked here because it
 * is entered in the send dialog.
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
