import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import {
  NewStaffCohortAttendeeGoalStatusEnum,
  NewStaffCohortAttributesInput,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { dateFormatShort } from 'src/lib/intlFormat';
import { StatusChipColor } from '../Shared/StatusChip';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';

export const DEFAULT_ROWS_PER_PAGE = 5;

export enum MpdGoalAdminTabEnum {
  ActiveGoals = 'active-goals',
  ScenarioGoals = 'scenario-goals',
}

/** The tab lives in the URL so Goal Settings can link back to the one it came from. */
export const parseMpdGoalAdminTab = (
  value: string | undefined,
): MpdGoalAdminTabEnum =>
  value === MpdGoalAdminTabEnum.ScenarioGoals
    ? MpdGoalAdminTabEnum.ScenarioGoals
    : MpdGoalAdminTabEnum.ActiveGoals;

export const mpdGoalAdminUrl = (
  accountListId: string,
  tab: MpdGoalAdminTabEnum,
): string => `/accountLists/${accountListId}/hrTools/mpdGoalAdmin?tab=${tab}`;

/** Goal Settings for one training attendee, keyed by the household's account list. */
export const staffDetailsUrl = (
  accountListId: string,
  staffAccountListId: string,
): string =>
  `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/staff/${staffAccountListId}`;

export const scenarioGoalUrl = (
  accountListId: string,
  scenarioGoalId: string,
): string =>
  `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/scenario/${scenarioGoalId}`;

/** The API's goal status, re-exported under the shorter name this feature uses. */
export { NewStaffCohortAttendeeGoalStatusEnum as GoalStatusEnum };

type CohortNode = NewStaffCohortsQuery['newStaffCohorts']['nodes'][number];
type AttendeeNode =
  NewStaffCohortAttendeesQuery['newStaffCohort']['attendees']['nodes'][number];

export interface StaffGoalRow {
  id: string;
  /** The household's account list, which its Staff Details page is keyed by. */
  accountListId: string;
  name: string;
  ministry: string;
  geography: string;
  /** MPD goal amount in USD; null until the goal calculation exists. */
  mpdGoal: number | null;
  goalStatus: NewStaffCohortAttendeeGoalStatusEnum;
  /** ISO timestamp of the batch that sent this household; null until sent. */
  goalSentAt: string | null;
  /** null before the survey establishes the household's marital status. */
  familyStatus: NewStaffQuestionnaireMaritalStatusEnum | null;
  /** null renders an "Assign Coach" prompt instead of a name. */
  coach: string | null;
  /** Read-only OneApp coordinators; a ministry commonly has several. */
  coordinators: string[];
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
  /** When the last Run & Send batch finished; null until the first send. Kept
   *  unformatted so the banner can split date and time across its own sentence. */
  goalsSentAt: DateTime | null;
  hasTrainingCosts: boolean;
  canRunAndSend: boolean;
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
  goalsSentAt: node.goalsSentAt ? DateTime.fromISO(node.goalsSentAt) : null,
  hasTrainingCosts: node.hasTrainingCosts,
  canRunAndSend: node.canRunAndSend,
  trainingCosts: cohortToTrainingCosts(node),
});

export const attendeeToRow = (attendee: AttendeeNode): StaffGoalRow => ({
  id: attendee.id,
  accountListId: attendee.accountListId,
  name: attendee.displayName,
  ministry: attendee.ministry?.name ?? '',
  geography: attendee.geographicLocation ?? '',
  // Absent until the questionnaire completes; the row still renders.
  mpdGoal: attendee.newStaffGoalCalculation?.monthlyGoal ?? null,
  goalStatus: attendee.goalStatus,
  goalSentAt: attendee.goalSentAt ?? null,
  familyStatus: attendee.familyStatus ?? null,
  // Both names null joins to '', which must still render the Assign Coach prompt.
  coach: attendee.coach
    ? [attendee.coach.firstName, attendee.coach.lastName]
        .filter(Boolean)
        .join(' ') || null
    : null,
  coordinators: [...attendee.coordinators],
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

/** Complete is ready to send and Sent is already done; only Incomplete needs action. */
export const goalStatusColor = (
  status: NewStaffCohortAttendeeGoalStatusEnum,
): StatusChipColor => {
  switch (status) {
    case NewStaffCohortAttendeeGoalStatusEnum.Complete:
      return 'success';
    case NewStaffCohortAttendeeGoalStatusEnum.Sent:
      return 'info';
    default:
      return 'warning';
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
