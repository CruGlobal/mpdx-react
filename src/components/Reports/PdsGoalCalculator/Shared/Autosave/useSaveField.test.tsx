import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import {
  DesignationSupportSalaryType,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsMock,
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../../PdsGoalCalculatorTestWrapper';
import { useSaveField } from './useSaveField';

const mutationSpy = jest.fn();

const buildWrapper = (
  calculationMock: PdsGoalCalculationMock,
  constantsMock?: GoalCalculatorConstantsMock,
): React.FC<{ children: React.ReactNode }> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <PdsGoalCalculatorTestWrapper
      calculationMock={calculationMock}
      constantsMock={constantsMock}
      onCall={mutationSpy}
    >
      {children}
    </PdsGoalCalculatorTestWrapper>
  );
  return Wrapper;
};

describe('useSaveField', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('updates the calculation when a value changes', async () => {
    const { result } = renderHook(useSaveField, {
      wrapper: buildWrapper({
        id: 'goal-1',
        name: 'Test Goal',
        payRate: 50000,
      }),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
    );

    result.current({ name: 'New Name' });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: { id: 'goal-1', name: 'New Name' },
      }),
    );
  });

  it('recomputes totalMonthlySupportGoal with the floored total when a salary input changes', async () => {
    const { result } = renderHook(useSaveField, {
      wrapper: buildWrapper({
        id: 'goal-1',
        salaryOrHourly: DesignationSupportSalaryType.Salaried,
        payRate: 48000,
        hoursWorkedPerWeek: null,
        geographicLocation: null,
        totalMonthlySupportGoal: 0,
      }),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
    );

    result.current({ payRate: 60000 });

    // 60000 / 12 = 5000; FICA 0.08 -> 400; subtotal 5400
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          payRate: 60000,
          totalMonthlySupportGoal: 5400,
        },
      }),
    );
  });

  it('recomputes totalReimbursableExpenses with the floor applied when a reimbursable input changes', async () => {
    const { result } = renderHook(useSaveField, {
      wrapper: buildWrapper(
        {
          id: 'goal-1',
          ministryCellPhone: 0,
          ministryInternet: 0,
          mpdNewsletter: 0,
          mpdMiscellaneous: 0,
          accountTransfers: 0,
          otherMonthlyReimbursements: 0,
          conferenceRetreatCosts: 0,
          ministryTravelMeals: 0,
          otherAnnualReimbursements: 0,
          totalReimbursableExpenses: 0,
        },
        {
          mpdGoalMiscConstants: [
            {
              category: MpdGoalMiscConstantCategoryEnum.AdditionalRates,
              label: MpdGoalMiscConstantLabelEnum.MinimumReimbursable,
              fee: 300,
            },
          ],
        },
      ),
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('PdsGoalCalculation'),
    );

    result.current({ ministryCellPhone: 100 });

    // raw 100 < 300 floor → total clamps to 300
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdatePdsGoalCalculation', {
        attributes: {
          id: 'goal-1',
          ministryCellPhone: 100,
          totalReimbursableExpenses: 300,
        },
      }),
    );
  });
});
