import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from './goalCalculatorConstants.generated';
import { useGoalCalculatorConstants } from './useGoalCalculatorConstants';

const mockData = {
  constant: {
    __typename: 'Constant' as const,
    mpdGoalBenefitsConstants: [
      {
        __typename: 'MpdGoalBenefitsConstant' as const,
        id: '3d0a4925-214c-4e2e-b800-e97e31c727d8',
        size: MpdGoalBenefitsConstantSizeEnum.Single,
        sizeDisplayName: 'Single or spouse not staff',
        plan: MpdGoalBenefitsConstantPlanEnum.Select,
        planDisplayName: 'Select',
        cost: 1204.45,
      },
      {
        __typename: 'MpdGoalBenefitsConstant' as const,
        id: '317a7530-1313-4f6a-a756-00520a3c01a3',
        size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
        sizeDisplayName: 'Married with no children',
        plan: MpdGoalBenefitsConstantPlanEnum.Base,
        planDisplayName: 'Base',
        cost: 1093.96,
      },
    ],
    mpdGoalGeographicConstants: [
      {
        __typename: 'MpdGoalGeographicConstant' as const,
        id: 'd1097a97-2a16-4c48-9ab5-5121d8ca129e',
        location: 'None',
        percentageMultiplier: 0,
      },
      {
        __typename: 'MpdGoalGeographicConstant' as const,
        id: '32818f68-59f7-4a06-83c6-6d286ec29bbf',
        location: 'Atlanta, GA',
        percentageMultiplier: 0.12,
      },
    ],
    mpdGoalMiscConstants: [
      {
        __typename: 'MpdGoalMiscConstant' as const,
        id: '5a92245c-a6ca-4d97-8e7c-b88203573ebd',
        category: MpdGoalMiscConstantCategoryEnum.Rates,
        categoryDisplayName: 'Rates',
        label: MpdGoalMiscConstantLabelEnum.AdminRate,
        labelDisplayName: 'Administrative Rate',
        fee: 0.12,
      },
      {
        __typename: 'MpdGoalMiscConstant' as const,
        id: '8d0d738e-6031-4336-8c27-cb9a52b58b0e',
        category: MpdGoalMiscConstantCategoryEnum.DebtPercentage,
        categoryDisplayName: 'Debt Percentage',
        label: MpdGoalMiscConstantLabelEnum.Seca,
        labelDisplayName: 'Self-Employment Contributions Act',
        fee: 0.22,
      },
    ],
  },
};

describe('useGoalCalculatorConstants', () => {
  it('should show loading state when no data', () => {
    const { result } = renderHook(() => useGoalCalculatorConstants(), {
      wrapper: ({ children }: { children: ReactElement }) => (
        <GqlMockedProvider mocks={{}}>{children}</GqlMockedProvider>
      ),
    });

    expect(result.current).toEqual({
      goalBenefitsConstantMap: new Map(),
      goalMiscConstantMap: new Map(),
      goalGeographicConstantMap: new Map(),
      loading: true,
      error: undefined,
    });
  });

  it('should format data correctly', async () => {
    const { result } = renderHook(() => useGoalCalculatorConstants(), {
      wrapper: ({ children }: { children: ReactElement }) => (
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        }>
          mocks={{
            GoalCalculatorConstants: mockData,
          }}
        >
          {children}
        </GqlMockedProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        goalBenefitsConstantMap: new Map([
          [
            'SINGLE-SELECT',
            {
              __typename: 'MpdGoalBenefitsConstant',
              id: '3d0a4925-214c-4e2e-b800-e97e31c727d8',
              size: 'SINGLE',
              sizeDisplayName: 'Single or spouse not staff',
              plan: 'SELECT',
              planDisplayName: 'Select',
              cost: 1204.45,
            },
          ],
          [
            'MARRIED_NO_CHILDREN-BASE',
            {
              __typename: 'MpdGoalBenefitsConstant',
              id: '317a7530-1313-4f6a-a756-00520a3c01a3',
              size: 'MARRIED_NO_CHILDREN',
              sizeDisplayName: 'Married with no children',
              plan: 'BASE',
              planDisplayName: 'Base',
              cost: 1093.96,
            },
          ],
        ]),
        goalMiscConstantMap: new Map([
          [
            MpdGoalMiscConstantLabelEnum.AdminRate,
            {
              __typename: 'MpdGoalMiscConstant',
              id: '5a92245c-a6ca-4d97-8e7c-b88203573ebd',
              category: MpdGoalMiscConstantCategoryEnum.Rates,
              categoryDisplayName: 'Rates',
              labelDisplayName: 'Administrative Rate',
              fee: 0.12,
            },
          ],
          [
            // cSpell:ignore Seca
            MpdGoalMiscConstantLabelEnum.Seca,
            {
              __typename: 'MpdGoalMiscConstant',
              id: '8d0d738e-6031-4336-8c27-cb9a52b58b0e',
              category: MpdGoalMiscConstantCategoryEnum.DebtPercentage,
              categoryDisplayName: 'Debt Percentage',
              labelDisplayName: 'Self-Employment Contributions Act',
              fee: 0.22,
            },
          ],
        ]),
        goalGeographicConstantMap: new Map([
          ['None', 0],
          ['Atlanta, GA', 0.12],
        ]),
        loading: false,
        error: undefined,
      });
    });
  });
});
