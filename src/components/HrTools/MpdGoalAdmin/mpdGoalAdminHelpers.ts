export enum MpdGoalAdminTabEnum {
  ActiveGoals = 'active-goals',
  ScenarioGoals = 'scenario-goals',
}

export enum GoalStatusEnum {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
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
