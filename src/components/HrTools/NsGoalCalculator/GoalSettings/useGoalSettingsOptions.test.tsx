import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import { useGoalSettingsOptions } from './useGoalSettingsOptions';

const constantsMock: GoalCalculatorConstantsQuery = {
  constant: {
    __typename: 'Constant',
    mpdGoalBenefitsConstants: [
      {
        __typename: 'MpdGoalBenefitsConstant',
        id: 'benefits-1',
        size: MpdGoalBenefitsConstantSizeEnum.Single,
        sizeDisplayName: 'Single or spouse not staff',
        plan: MpdGoalBenefitsConstantPlanEnum.Select,
        planDisplayName: 'Select',
        cost: 1204.45,
      },
      {
        __typename: 'MpdGoalBenefitsConstant',
        id: 'benefits-2',
        size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
        sizeDisplayName: 'Married with no children',
        // Repeated plan across a second size — should be deduped.
        plan: MpdGoalBenefitsConstantPlanEnum.Select,
        planDisplayName: 'Select',
        cost: 1910.54,
      },
      {
        __typename: 'MpdGoalBenefitsConstant',
        id: 'benefits-3',
        size: MpdGoalBenefitsConstantSizeEnum.Single,
        sizeDisplayName: 'Single or spouse not staff',
        plan: MpdGoalBenefitsConstantPlanEnum.Base,
        planDisplayName: 'Base',
        cost: 1008.6,
      },
    ],
    mpdGoalGeographicConstants: [
      {
        __typename: 'MpdGoalGeographicConstant',
        id: 'geo-1',
        location: 'Orlando, FL',
        percentageMultiplier: 0.06,
      },
      {
        __typename: 'MpdGoalGeographicConstant',
        id: 'geo-2',
        location: 'New York, NY',
        percentageMultiplier: 0.25,
      },
    ],
    mpdGoalMiscConstants: [],
  },
};

const wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GoalCalculatorConstants: GoalCalculatorConstantsQuery }>
    mocks={{ GoalCalculatorConstants: constantsMock }}
  >
    {children}
  </GqlMockedProvider>
);

describe('useGoalSettingsOptions', () => {
  it('spans calculation years from joinedStaffYear to the current year, newest first', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(2018), {
      wrapper,
    });

    expect(result.current.calculationsYear).toEqual([
      { value: '2020', label: '2020' },
      { value: '2019', label: '2019' },
      { value: '2018', label: '2018' },
    ]);
  });

  it('offers only the current year when joinedStaffYear is missing', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.calculationsYear).toEqual([
      { value: '2020', label: '2020' },
    ]);
  });

  it('offers only the current year when joinedStaffYear is in the future', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(2030), {
      wrapper,
    });

    expect(result.current.calculationsYear).toEqual([
      { value: '2020', label: '2020' },
    ]);
  });

  it('derives age options from the GoalCalculationAge enum', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.age).toEqual([
      { value: 'UNDER_THIRTY', label: 'Under 30' },
      { value: 'THIRTY_TO_THIRTY_FOUR', label: '30-34' },
      { value: 'THIRTY_FIVE_TO_THIRTY_NINE', label: '35-39' },
      { value: 'OVER_FORTY', label: 'Over 40' },
    ]);
  });

  it('derives role options from the GoalCalculationRole enum', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.role).toEqual([
      { value: 'FIELD', label: 'Field' },
      { value: 'OFFICE', label: 'Office' },
    ]);
  });

  it('derives NSO housing options from NewStaffQuestionnaireNsoHousingEnum', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.nsoHousing).toEqual([
      { value: 'SINGLE_ROOM', label: 'Single in hotel/dorm room' },
      { value: 'SHARED_ROOM', label: 'Sharing 2 in hotel/dorm room' },
      { value: 'COUPLE_ROOM', label: 'Couple in hotel/dorm room' },
      { value: 'FAMILY_ROOM', label: 'Family in a hotel/room' },
      { value: 'LOCAL_COMMUTING', label: 'Local / Commuting' },
    ]);
  });

  it('derives NSO session options from NewStaffQuestionnaireNsoSessionsEnum', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.nsoSessions).toEqual([
      { value: 'IBS_AND_NSO', label: 'IBS and NSO' },
      { value: 'NSO', label: 'NSO' },
    ]);
  });

  it('derives benefits plan options from the MpdGoalBenefitsConstantPlanEnum', () => {
    const { result } = renderHook(() => useGoalSettingsOptions(), { wrapper });

    expect(result.current.benefitsPlan).toEqual([
      { value: 'SELECT', label: 'Select' },
      { value: 'PLUS', label: 'Plus' },
      { value: 'BASE', label: 'Base' },
      { value: 'MINIMUM', label: 'Minimum' },
      { value: 'EXEMPT', label: 'Exempt' },
    ]);
  });

  it('sources geographic location options from the constants query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useGoalSettingsOptions(),
      { wrapper },
    );

    expect(result.current.geographicLocation).toEqual([]);

    await waitForNextUpdate();

    expect(result.current.geographicLocation).toEqual([
      { value: 'Orlando, FL', label: 'Orlando, FL' },
      { value: 'New York, NY', label: 'New York, NY' },
    ]);
  });
});
