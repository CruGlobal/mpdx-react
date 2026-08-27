import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffCohortAttributesInput,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { dateFormatShort } from 'src/lib/intlFormat';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';

export enum MpdGoalAdminTabEnum {
  ActiveGoals = 'active-goals',
  ScenarioGoals = 'scenario-goals',
}

/** The API's goal status, re-exported under the shorter name this feature uses. */
export { NewStaffCohortAttendeeGoalStatusEnum as GoalStatusEnum };

type CohortNode = NewStaffCohortsQuery['newStaffCohorts']['nodes'][number];
type AttendeeNode =
  NewStaffCohortAttendeesQuery['newStaffCohort']['attendees']['nodes'][number];

export interface StaffGoalRow {
  id: string;
  name: string;
  ministry: string;
  geography: string;
  /** MPD goal amount in USD; null until the goal calculation exists. */
  mpdGoal: number | null;
  goalStatus: NewStaffCohortAttendeeGoalStatusEnum;
  /** null before the survey establishes the household's marital status. */
  familyStatus: NewStaffQuestionnaireMaritalStatusEnum | null;
  /** null renders an "Assign Coach" prompt instead of a name. */
  coach: string | null;
  coordinator: string;
}

/** USD costs from the modal; one key per `NewStaffCohort::COST_FIELDS` column. */
export interface TrainingCosts {
  /** NSO Cost */
  nsoIndividual1InRoom: number;
  nsoIndividual2InRoom: number;
  nsoCouple: number;
  nsoFamily: number;
  /** IBS Cost */
  ibsSingle: number;
  ibsCouple: number;
  /** Refresh Retreat */
  refreshRetreatSingle: number;
  refreshRetreatCouple: number;
  /** Faith and Finance */
  faithAndFinanceSingle: number;
  faithAndFinanceCouple: number;
  /** Cru Conference */
  cruConferenceSingle: number;
  cruConferenceCouple: number;
  cruConferenceFamily: number;
}

export type TrainingCostFieldName = keyof TrainingCosts;

/** Drives the form, its validation, and both directions of the API mapping. */
export const TRAINING_COST_FIELDS: TrainingCostFieldName[] = [
  'nsoIndividual1InRoom',
  'nsoIndividual2InRoom',
  'nsoCouple',
  'nsoFamily',
  'ibsSingle',
  'ibsCouple',
  'refreshRetreatSingle',
  'refreshRetreatCouple',
  'faithAndFinanceSingle',
  'faithAndFinanceCouple',
  'cruConferenceSingle',
  'cruConferenceCouple',
  'cruConferenceFamily',
];

/** Template-literal typed so a rename fails to compile rather than dropping a cost. */
const costFieldName = <Field extends TrainingCostFieldName>(
  field: Field,
): `${Field}Cost` => `${field}Cost`;

export interface Cohort {
  id: string;
  name: string;
  trainingSize: number;
  /** Display string, e.g. "08/10/2026"; "—" when the API has no date yet. */
  nsoDate: string;
  hasTrainingCosts: boolean;
  /** Saved training cost figures; undefined until every cost is entered. */
  trainingCosts?: TrainingCosts;
}

/** Undefined unless all 13 are set, so a partial cohort opens blank not part-filled. */
export const cohortToTrainingCosts = (
  cohort: Pick<CohortNode, `${TrainingCostFieldName}Cost`>,
): TrainingCosts | undefined => {
  const costs = {} as TrainingCosts;
  for (const field of TRAINING_COST_FIELDS) {
    const value = cohort[costFieldName(field)];
    if (typeof value !== 'number') {
      return undefined;
    }
    costs[field] = value;
  }
  return costs;
};

/** Maps the modal's costs onto the mutation's attributes input. */
export const trainingCostsToAttributes = (
  costs: TrainingCosts,
): NewStaffCohortAttributesInput =>
  TRAINING_COST_FIELDS.reduce<NewStaffCohortAttributesInput>((input, field) => {
    input[costFieldName(field)] = costs[field];
    return input;
  }, {});

export const cohortNodeToCohort = (
  node: CohortNode,
  locale: string,
): Cohort => ({
  id: node.id,
  name: node.name,
  trainingSize: node.trainingSize,
  nsoDate: node.date
    ? dateFormatShort(DateTime.fromISO(node.date), locale)
    : '—',
  hasTrainingCosts: node.hasTrainingCosts,
  trainingCosts: cohortToTrainingCosts(node),
});

export const attendeeToRow = (attendee: AttendeeNode): StaffGoalRow => ({
  id: attendee.id,
  name: attendee.displayName,
  ministry: attendee.ministry?.name ?? '',
  geography: attendee.geographicLocation ?? '',
  // Absent until the questionnaire completes; the row still renders.
  mpdGoal: attendee.newStaffGoalCalculation?.monthlyGoal ?? null,
  goalStatus: attendee.goalStatus,
  familyStatus: attendee.familyStatus ?? null,
  // Both names null joins to '', which must still render the Assign Coach prompt.
  coach: attendee.coach
    ? [attendee.coach.firstName, attendee.coach.lastName]
        .filter(Boolean)
        .join(' ') || null
    : null,
  coordinator: attendee.coordinators.join(', '),
});

export const familyStatusLabel = (
  status: NewStaffQuestionnaireMaritalStatusEnum | null,
  t: TFunction,
): string => {
  switch (status) {
    case NewStaffQuestionnaireMaritalStatusEnum.Married:
      return t('Married');
    case NewStaffQuestionnaireMaritalStatusEnum.Single:
      return t('Single');
    case NewStaffQuestionnaireMaritalStatusEnum.Sosa:
      return t('Spouse of Staff Applicant');
    default:
      return '';
  }
};

export const goalStatusLabel = (
  status: NewStaffCohortAttendeeGoalStatusEnum,
  t: TFunction,
): string => {
  switch (status) {
    case NewStaffCohortAttendeeGoalStatusEnum.Complete:
      return t('Complete');
    case NewStaffCohortAttendeeGoalStatusEnum.Sent:
      return t('Sent');
    default:
      return t('Incomplete');
  }
};

/** Sendable means Complete only; an already-sent goal is deliberately excluded. */
export const isSendable = (row: {
  goalStatus: NewStaffCohortAttendeeGoalStatusEnum;
}): boolean => row.goalStatus === NewStaffCohortAttendeeGoalStatusEnum.Complete;

/** Already-sent goals are split from incomplete ones so the modal can differ. */
export const partitionSendable = <
  T extends { goalStatus: NewStaffCohortAttendeeGoalStatusEnum },
>(
  rows: T[],
): { sendable: T[]; alreadySent: T[]; incomplete: T[] } => {
  const sendable: T[] = [];
  const alreadySent: T[] = [];
  const incomplete: T[] = [];
  for (const row of rows) {
    if (isSendable(row)) {
      sendable.push(row);
    } else if (row.goalStatus === NewStaffCohortAttendeeGoalStatusEnum.Sent) {
      alreadySent.push(row);
    } else {
      incomplete.push(row);
    }
  }
  return { sendable, alreadySent, incomplete };
};
