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

/**
 * The admin table's goal status, straight from the API. Re-exported under the
 * shorter name the table and run-and-send flow already use.
 */
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

/**
 * Per-training cost figures captured in the "Edit Training Costs" modal. Every
 * value is a USD amount; the keys mirror the modal's five cost sections. All
 * fields are required in the UI, so a saved `TrainingCosts` is fully populated.
 *
 * There is one key per column in `NewStaffCohort::COST_FIELDS` in mpdx_api. The
 * API names each column with a `Cost` suffix (`nsoCouple` here is `nsoCoupleCost`
 * there), which `costFieldName` below is the single source of truth for. NSO and
 * IBS are separate so an attendee going to NSO but not IBS can be costed
 * (MPDX-9811; Figma node 789-32532).
 */
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

/**
 * Every cost field, in the order the modal lays them out. Drives the form, the
 * validation schema, and both directions of the API mapping, so a new cost
 * column is added here once.
 */
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

/**
 * The API's name for a cost field. Typed as a template literal so a rename on
 * either side fails to compile rather than silently dropping a cost on save.
 */
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

/**
 * Reads the cohort's saved costs back into the modal's shape.
 *
 * The API's cost columns are individually nullable, but the modal treats costs
 * as all-or-nothing. Returning undefined unless every field is populated opens
 * the modal blank rather than part-filled, so a partial cohort can't be saved
 * back with stale gaps.
 */
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
  // The calculation is absent until the questionnaire completes; the row still
  // renders, with a placeholder in the goal column alongside an Incomplete chip.
  mpdGoal: attendee.newStaffGoalCalculation?.monthlyGoal ?? null,
  goalStatus: attendee.goalStatus,
  familyStatus: attendee.familyStatus ?? null,
  // `|| null`: a coach whose names are both null joins to '', which must still
  // render the Assign Coach prompt.
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

/**
 * Single source of truth for whether a goal row can be sent (made active and
 * dispatched to staff and coach). A row is sendable only when its goal is
 * complete — an already-sent goal is deliberately excluded. Both the table
 * status chip and the run-and-send modal derive sendability from this
 * predicate so the invariant lives in exactly one place.
 */
export const isSendable = (row: {
  goalStatus: NewStaffCohortAttendeeGoalStatusEnum;
}): boolean => row.goalStatus === NewStaffCohortAttendeeGoalStatusEnum.Complete;

/**
 * Splits rows into those that can be sent and those that cannot, preserving
 * order within each group. The unsendable rows are split further — already-sent
 * goals are done, not incomplete, so the modal must describe them differently.
 */
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
