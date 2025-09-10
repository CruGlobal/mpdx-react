import { renderHook } from '@testing-library/react-hooks';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  MpdGoalMiscConstantEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from '../components/Reports/GoalCalculator/Shared/GoalCalculation.generated';
import { useFormatConstants } from './useFormatConstants';

const mockData = {
  constant: {
    __typename: 'Constant',
    mpdGoalBenefitsConstants: [
      {
        __typename: 'MpdGoalBenefitsConstant',
        id: '3d0a4925-214c-4e2e-b800-e97e31c727d8',
        size: MpdGoalBenefitsConstantSizeEnum.Single,
        plan: MpdGoalBenefitsConstantPlanEnum.Select,
        cost: 1204.45,
      },
      {
        __typename: 'MpdGoalBenefitsConstant',
        id: '317a7530-1313-4f6a-a756-00520a3c01a3',
        size: MpdGoalBenefitsConstantSizeEnum.Married,
        plan: MpdGoalBenefitsConstantPlanEnum.Base,
        cost: 1093.96,
      },
    ],
    mpdGoalGeographicConstants: [
      {
        __typename: 'MpdGoalGeographicConstant',
        id: 'd1097a97-2a16-4c48-9ab5-5121d8ca129e',
        location: 'None',
        percentageMultiplier: 0,
      },
      {
        __typename: 'MpdGoalGeographicConstant',
        id: '32818f68-59f7-4a06-83c6-6d286ec29bbf',
        location: 'Atlanta, GA',
        percentageMultiplier: 0.12,
      },
    ],
    mpdGoalMiscConstants: [
      {
        __typename: 'MpdGoalMiscConstant',
        id: '5a92245c-a6ca-4d97-8e7c-b88203573ebd',
        category: MpdGoalMiscConstantEnum.AdminRate,
        label: '0.12',
      },
      {
        __typename: 'MpdGoalMiscConstant',
        id: '8d0d738e-6031-4336-8c27-cb9a52b58b0e',
        category: MpdGoalMiscConstantEnum.Seca,
        label: '0.22',
      },
    ],
  },
} as GoalCalculatorConstantsQuery;

describe('useFormatConstants', () => {
  it('should load empty data', () => {
    const { result } = renderHook(() => useFormatConstants());

    expect(result.current).toEqual({
      goalBenefitsConstantMap: new Map(),
      goalMiscConstantMap: new Map(),
      goalGeographicConstant: [],
    });
  });

  it('should format data correctly', () => {
    const { result } = renderHook(() => useFormatConstants(mockData));

    expect(result.current).toEqual({
      goalBenefitsConstantMap: new Map([
        [
          'SINGLE-SELECT',
          {
            plan: 'SELECT',
            size: 'SINGLE',
            cost: 1204.45,
          },
        ],
        [
          'MARRIED-BASE',
          {
            plan: 'BASE',
            size: 'MARRIED',
            cost: 1093.96,
          },
        ],
      ]),
      goalMiscConstantMap: new Map([
        ['ADMIN_RATE', '0.12'],
        ['SECA', '0.22'],
      ]),
      goalGeographicConstant: [
        {
          location: 'None',
          percentageMultiplier: 0,
        },
        {
          location: 'Atlanta, GA',
          percentageMultiplier: 0.12,
        },
      ],
    });
  });
});
