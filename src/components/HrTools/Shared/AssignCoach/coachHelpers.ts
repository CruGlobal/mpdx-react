import { TFunction } from 'react-i18next';

/** One selectable coach in the Assign Coach picker. */
export interface AssignCoachOption {
  id: string;
  name: string;
}

/** Every identifier is independently nullable, so labelling has to fall back. */
export interface CoachFields {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

/** Both names are nullable, so a coach can legitimately have no name at all. */
export const coachName = (
  coach: Pick<CoachFields, 'firstName' | 'lastName'>,
): string | null =>
  [coach.firstName, coach.lastName].filter(Boolean).join(' ') || null;

/** Every place that names a coach shares this, so they can never disagree. */
export const coachLabel = (coach: CoachFields, t: TFunction): string =>
  coachName(coach) ?? coach.email ?? t('Unnamed coach');

export const coachToOption = (
  coach: CoachFields,
  t: TFunction,
): AssignCoachOption => ({
  id: coach.id,
  name: coachLabel(coach, t),
});
