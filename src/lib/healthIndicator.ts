import { DateTime } from 'luxon';
import { AccountList, HealthIndicatorData } from 'src/graphql/types.generated';

export enum GoalSource {
  Preferences = 'Preferences',
  MachineCalculated = 'MachineCalculated',
}

interface HealthIndicatorInfo {
  /**
   * The overall goal, `null` if it is not loaded or is unavailable. It is the preferences goal if
   * it is set, and defaults to the machine-calculated goal otherwise.
   **/
  goal: number | null;

  /** Whether the goal came from preferences is is machine-calculated */
  goalSource: GoalSource | null;

  /** The machine-calculated goal, `null` if it is not loaded or is unavailable */
  machineCalculatedGoal: number | null;

  /** The machine-calculated goal's currency, `null` if it is not loaded or is unavailable */
  machineCalculatedGoalCurrency: string | null;

  /**
   * The machine-calculated goal, `null` if it is not loaded or is unavailable.
   *
   * WARNING: Unlike `machineCalculatedGoal`, it will be set even if its currency doesn't match the
   * user's currency. It may be displayed to the user, but care must be taken not to use it in
   * any numerical calculations because all other amounts will be in the user's currency.
   **/
  unsafeMachineCalculatedGoal: number | null;

  /** The goal set in preferences, `null` if it is not loaded or is unavailable */
  preferencesGoal: number | null;

  /** The date that the preferences goal was last updated */
  preferencesGoalUpdatedAt: DateTime | null;

  /** `true` if the preferences goal is less than the machine-calculated goal */
  preferencesGoalLow: boolean;

  /** `true` if the preferences goal has not been updated in the last year */
  preferencesGoalOld: boolean;
}

export const getHealthIndicatorInfo = (
  accountList:
    | Pick<AccountList, 'currency' | 'monthlyGoal' | 'monthlyGoalUpdatedAt'>
    | null
    | undefined,
  healthIndicatorData:
    | Pick<
        HealthIndicatorData,
        'machineCalculatedGoal' | 'machineCalculatedGoalCurrency'
      >
    | null
    | undefined,
): HealthIndicatorInfo => {
  const mismatchedCurrencies =
    !!accountList &&
    !!healthIndicatorData &&
    accountList.currency !== healthIndicatorData.machineCalculatedGoalCurrency;
  // The machine-calculated goal cannot be used if its currency does not match the account list's currency
  const machineCalculatedGoal =
    !mismatchedCurrencies && healthIndicatorData?.machineCalculatedGoal
      ? healthIndicatorData.machineCalculatedGoal
      : null;
  const machineCalculatedGoalCurrency =
    healthIndicatorData?.machineCalculatedGoalCurrency ?? null;
  const unsafeMachineCalculatedGoal =
    healthIndicatorData?.machineCalculatedGoal ?? null;

  const preferencesGoal = accountList?.monthlyGoal ?? null;
  const preferencesGoalUpdatedAt =
    preferencesGoal !== null &&
    typeof accountList?.monthlyGoalUpdatedAt === 'string'
      ? DateTime.fromISO(accountList.monthlyGoalUpdatedAt)
      : null;
  const preferencesGoalLow =
    preferencesGoal !== null &&
    machineCalculatedGoal !== null &&
    preferencesGoal < machineCalculatedGoal;
  const preferencesGoalOld =
    preferencesGoalUpdatedAt !== null &&
    preferencesGoalUpdatedAt <= DateTime.now().minus({ year: 1 });

  const goal = preferencesGoal ?? machineCalculatedGoal;
  const goalSource =
    preferencesGoal !== null
      ? GoalSource.Preferences
      : machineCalculatedGoal !== null
      ? GoalSource.MachineCalculated
      : null;

  return {
    goal,
    goalSource,
    machineCalculatedGoal,
    machineCalculatedGoalCurrency,
    unsafeMachineCalculatedGoal,
    preferencesGoal,
    preferencesGoalUpdatedAt,
    preferencesGoalLow,
    preferencesGoalOld,
  };
};
