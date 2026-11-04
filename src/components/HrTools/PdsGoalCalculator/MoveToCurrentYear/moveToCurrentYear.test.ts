import {
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { GoalMiscConstants } from 'src/hooks/useGoalCalculatorConstants';
import { PdsGoalCalculationFieldsFragment } from '../GoalsList/PdsGoalCalculations.generated';
import {
  buildCurrentYearCalculation,
  getCappedAmountChanges,
} from './moveToCurrentYear';

const miscConstants = (phone: number, internet: number): GoalMiscConstants => ({
  [MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum]: {
    [MpdGoalMiscConstantLabelEnum.Phone]: {
      id: 'phone',
      category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
      categoryDisplayName: 'Reimbursements With Maximum',
      label: MpdGoalMiscConstantLabelEnum.Phone,
      labelDisplayName: 'Phone',
      fee: phone,
    },
    [MpdGoalMiscConstantLabelEnum.Internet]: {
      id: 'internet',
      category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
      categoryDisplayName: 'Reimbursements With Maximum',
      label: MpdGoalMiscConstantLabelEnum.Internet,
      labelDisplayName: 'Internet',
      fee: internet,
    },
  },
});

const calculation = {
  id: 'goal-1',
  calculationsYear: 2019,
  ministryCellPhone: 80,
  ministryInternet: 50,
} as PdsGoalCalculationFieldsFragment;

describe('getCappedAmountChanges', () => {
  it('lowers amounts over the new max', () => {
    expect(
      getCappedAmountChanges(
        calculation,
        miscConstants(80, 60),
        miscConstants(70, 60),
      ),
    ).toEqual([
      { field: 'ministryCellPhone', amount: 80, newMax: 70, lowered: true },
    ]);
  });

  it('reports a higher new max without raising the amount', () => {
    expect(
      getCappedAmountChanges(
        calculation,
        miscConstants(80, 60),
        miscConstants(90, 60),
      ),
    ).toEqual([
      { field: 'ministryCellPhone', amount: 80, newMax: 90, lowered: false },
    ]);
  });

  it('reports nothing when the max is unchanged', () => {
    expect(
      getCappedAmountChanges(
        calculation,
        miscConstants(80, 60),
        miscConstants(80, 60),
      ),
    ).toEqual([]);
  });

  it('skips amounts that are not set', () => {
    expect(
      getCappedAmountChanges(
        { ...calculation, ministryCellPhone: null, ministryInternet: null },
        miscConstants(80, 60),
        miscConstants(70, 50),
      ),
    ).toEqual([]);
  });
});

describe('buildCurrentYearCalculation', () => {
  it('moves the year and lowers amounts over the new max', () => {
    expect(
      buildCurrentYearCalculation(calculation, 2020, miscConstants(70, 60)),
    ).toEqual({
      ...calculation,
      calculationsYear: 2020,
      ministryCellPhone: 70,
      ministryInternet: 50,
    });
  });

  it('keeps amounts when the max is missing', () => {
    expect(buildCurrentYearCalculation(calculation, 2020, {})).toEqual({
      ...calculation,
      calculationsYear: 2020,
    });
  });
});
