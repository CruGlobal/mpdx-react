import { DateTime } from 'luxon';
import { GoalSource, getHealthIndicatorInfo } from './healthIndicator';

describe('getHealthIndicatorInfo', () => {
  it('attributes are null when the account list and HI data is loading', () => {
    expect(getHealthIndicatorInfo(null, null)).toEqual({
      goal: null,
      goalSource: null,
      mismatchedCurrencies: false,
      machineCalculatedGoal: null,
      machineCalculatedGoalCurrency: null,
      unsafeMachineCalculatedGoal: null,
      preferencesGoal: null,
      preferencesGoalUpdatedAt: null,
      preferencesGoalLow: false,
      preferencesGoalOld: false,
    });
  });

  it('uses the preferences goal if it is set', () => {
    expect(
      getHealthIndicatorInfo(
        {
          currency: 'USD',
          monthlyGoal: 2000,
          monthlyGoalUpdatedAt: '2019-06-01T00:00:00Z',
        },
        { machineCalculatedGoal: 1000, machineCalculatedGoalCurrency: 'USD' },
      ),
    ).toEqual({
      goal: 2000,
      goalSource: GoalSource.Preferences,
      mismatchedCurrencies: false,
      machineCalculatedGoal: 1000,
      machineCalculatedGoalCurrency: 'USD',
      unsafeMachineCalculatedGoal: 1000,
      preferencesGoal: 2000,
      preferencesGoalUpdatedAt: DateTime.local(2019, 6, 1),
      preferencesGoalLow: false,
      preferencesGoalOld: false,
    });
  });

  it('uses the preferences goal if machine-calculated goal is not loaded', () => {
    expect(
      getHealthIndicatorInfo(
        {
          currency: 'USD',
          monthlyGoal: 2000,
          monthlyGoalUpdatedAt: '2019-06-01T00:00:00Z',
        },
        null,
      ),
    ).toEqual({
      goal: 2000,
      goalSource: GoalSource.Preferences,
      mismatchedCurrencies: false,
      machineCalculatedGoal: null,
      machineCalculatedGoalCurrency: null,
      unsafeMachineCalculatedGoal: null,
      preferencesGoal: 2000,
      preferencesGoalUpdatedAt: DateTime.local(2019, 6, 1),
      preferencesGoalLow: false,
      preferencesGoalOld: false,
    });
  });

  it('uses the machine-calculated goal if a preferences goal is not set', () => {
    expect(
      getHealthIndicatorInfo(
        { currency: 'USD' },
        { machineCalculatedGoal: 1000, machineCalculatedGoalCurrency: 'USD' },
      ),
    ).toEqual({
      goal: 1000,
      goalSource: GoalSource.MachineCalculated,
      mismatchedCurrencies: false,
      machineCalculatedGoal: 1000,
      machineCalculatedGoalCurrency: 'USD',
      unsafeMachineCalculatedGoal: 1000,
      preferencesGoal: null,
      preferencesGoalUpdatedAt: null,
      preferencesGoalLow: false,
      preferencesGoalOld: false,
    });
  });

  it('ignores the machine-calculated goal if its currency does the preferences currency', () => {
    expect(
      getHealthIndicatorInfo(
        { currency: 'USD' },
        { machineCalculatedGoal: 1000, machineCalculatedGoalCurrency: 'EUR' },
      ),
    ).toMatchObject({
      goal: null,
      goalSource: null,
      mismatchedCurrencies: true,
      machineCalculatedGoal: null,
      machineCalculatedGoalCurrency: 'EUR',
      unsafeMachineCalculatedGoal: 1000,
    });
  });

  it('ignores the machine-calculated goal if its currency is not set', () => {
    expect(
      getHealthIndicatorInfo(
        { currency: 'USD' },
        { machineCalculatedGoal: 1000 },
      ),
    ).toMatchObject({
      goal: null,
      goalSource: null,
      mismatchedCurrencies: true,
      machineCalculatedGoal: null,
      machineCalculatedGoalCurrency: null,
      unsafeMachineCalculatedGoal: 1000,
    });
  });

  describe('preferencesGoalUpdatedAt', () => {
    it('is null when the preferences goal is not set', () => {
      expect(
        getHealthIndicatorInfo(
          { currency: 'USD', monthlyGoalUpdatedAt: '2019-06-01T00:00:00Z' },
          { machineCalculatedGoal: 1000, machineCalculatedGoalCurrency: 'EUR' },
        ),
      ).toMatchObject({
        preferencesGoal: null,
        preferencesGoalUpdatedAt: null,
      });
    });
  });

  describe('preferencesGoalLow', () => {
    it('is true when the preferences goal is less than the machine-calculated goal', () => {
      expect(
        getHealthIndicatorInfo(
          { currency: 'USD', monthlyGoal: 500 },
          { machineCalculatedGoal: 1000, machineCalculatedGoalCurrency: 'USD' },
        ).preferencesGoalLow,
      ).toBe(true);
    });
  });

  describe('preferencesGoalOld', () => {
    it('is true when the preferences goal is older than a year', () => {
      expect(
        getHealthIndicatorInfo(
          {
            currency: 'USD',
            monthlyGoal: 2000,
            monthlyGoalUpdatedAt: '2018-01-01T00:00:00Z',
          },
          {},
        ).preferencesGoalOld,
      ).toBe(true);
    });
  });
});
