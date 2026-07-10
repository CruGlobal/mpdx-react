export enum MpdGoalAdminTabEnum {
  ActiveGoals = 'active-goals',
  ScenarioGoals = 'scenario-goals',
}

export enum GoalStatusEnum {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
}

export interface StaffGoalRow {
  id: string;
  name: string;
  email: string;
  ministry: string;
  geography: string;
  /** MPD goal amount in USD. */
  mpdGoal: number;
  goalStatus: GoalStatusEnum;
  familyStatus: string;
  /** null renders an "Assign Coach" prompt instead of a name. */
  coach: string | null;
  coordinator: string;
}

/**
 * Per-training cost figures captured in the "Edit Training Costs" modal. Every
 * value is a USD amount; the keys mirror the modal's four cost sections. All
 * fields are required in the UI, so a saved `TrainingCosts` is fully populated.
 */
export interface TrainingCosts {
  /** NSO & IBS Cost */
  nsoIbsIndividual1InRoom: number;
  nsoIbsIndividual2InRoom: number;
  nsoIbsCouple: number;
  nsoIbsFamily: number;
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

export interface Cohort {
  id: string;
  name: string;
  trainingSize: number;
  /** Display string, e.g. "08/10/2026". */
  nsoDate: string;
  trainingCostEntered: boolean;
  /** Saved training cost figures; undefined until entered via the modal. */
  trainingCosts?: TrainingCosts;
  rows: StaffGoalRow[];
}

/**
 * Single source of truth for whether a goal row can be sent (made active and
 * dispatched to staff and coach). A row is sendable only when its goal is
 * complete. Both the table status chip and the run-and-send modal derive
 * sendability from this predicate so the invariant lives in exactly one place.
 */
export const isSendable = (row: { goalStatus: GoalStatusEnum }): boolean =>
  row.goalStatus === GoalStatusEnum.Complete;

/**
 * Splits rows into those that can be sent and those that cannot, preserving
 * order within each group.
 */
export const partitionSendable = <T extends { goalStatus: GoalStatusEnum }>(
  rows: T[],
): { sendable: T[]; notSendable: T[] } => {
  const sendable: T[] = [];
  const notSendable: T[] = [];
  for (const row of rows) {
    (isSendable(row) ? sendable : notSendable).push(row);
  }
  return { sendable, notSendable };
};
