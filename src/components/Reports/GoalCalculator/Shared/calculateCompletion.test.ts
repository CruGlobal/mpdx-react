import { gqlMock } from '__tests__/util/graphqlMocking';
import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import {
  BudgetFamilyFragment,
  BudgetFamilyFragmentDoc,
  GoalCalculationDocument,
  GoalCalculationQuery,
  GoalCalculationQueryVariables,
} from './GoalCalculation.generated';
import {
  completionPercentage,
  isCategoryComplete,
  isInformationComplete,
  isSettingsComplete,
} from './calculateCompletion';

const createMockGoalCalculation = (
  ministryCategories: Array<{
    directInput?: number | null;
    subCategories?: Array<{ amount: number }>;
  }> = [],
  householdCategories: Array<{
    directInput?: number | null;
    subCategories?: Array<{ amount: number }>;
  }> = [],
): GoalCalculationQuery['goalCalculation'] =>
  gqlMock<GoalCalculationQuery, GoalCalculationQueryVariables>(
    GoalCalculationDocument,
    {
      variables: { accountListId: 'account-list-1', id: 'goal-calculation-1' },
      mocks: {
        goalCalculation: {
          ministryFamily: {
            primaryBudgetCategories: ministryCategories.map(
              ({ directInput = null, subCategories = [] }) => ({
                directInput,
                subBudgetCategories: subCategories,
              }),
            ),
          },
          householdFamily: {
            primaryBudgetCategories: householdCategories.map(
              ({ directInput = null, subCategories = [] }) => ({
                directInput,
                subBudgetCategories: subCategories,
              }),
            ),
          },
        },
      },
    },
  ).goalCalculation;

describe('isSettingsComplete', () => {
  const goalCalculation = createMockGoalCalculation();

  it('should return false when goalCalculation is undefined', () => {
    expect(isSettingsComplete(undefined)).toBe(false);
  });

  it('should return true when name is set', () => {
    expect(isSettingsComplete({ ...goalCalculation, name: 'My Goal' })).toBe(
      true,
    );
  });

  it('should return false when name is not set', () => {
    expect(isSettingsComplete({ ...goalCalculation, name: null })).toBe(false);
  });
});

describe('isInformationComplete', () => {
  const goalCalculation = createMockGoalCalculation();

  it('should return false when goalCalculation is undefined', () => {
    expect(isInformationComplete(undefined)).toBe(false);
  });

  it('should return true when all required fields are filled', () => {
    expect(isInformationComplete(goalCalculation)).toBe(true);
  });

  it('should return false when firstName is missing', () => {
    expect(isInformationComplete({ ...goalCalculation, firstName: null })).toBe(
      false,
    );
  });

  it('should return false when mhaAmount is missing', () => {
    expect(isInformationComplete({ ...goalCalculation, mhaAmount: null })).toBe(
      false,
    );
  });

  it('should return true when optional fields are missing', () => {
    expect(
      isInformationComplete({
        ...goalCalculation,
        geographicLocation: null,
        ministryLocation: null,
        childrenNamesAges: null,
      }),
    ).toBe(true);
  });

  describe('with staff spouse', () => {
    const goalCalculation: GoalCalculationQuery['goalCalculation'] = {
      ...createMockGoalCalculation(),
      familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
    };

    it('should return true when all spouse fields are filled', () => {
      expect(isInformationComplete(goalCalculation)).toBe(true);
    });

    it('should return false when spouse firstName is missing', () => {
      expect(
        isInformationComplete({
          ...goalCalculation,
          spouseFirstName: null,
        }),
      ).toBe(false);
    });

    it('should return false when spouse mhaAmount is missing', () => {
      expect(
        isInformationComplete({
          ...goalCalculation,
          spouseMhaAmount: null,
        }),
      ).toBe(false);
    });
  });
});

describe('isCategoryComplete', () => {
  const createMockCategory = () =>
    gqlMock<BudgetFamilyFragment>(BudgetFamilyFragmentDoc, {
      mocks: {
        primaryBudgetCategories: [
          {
            directInput: null,
            subBudgetCategories: [{ amount: 0 }],
          },
        ],
      },
    }).primaryBudgetCategories[0];

  it('should return true when directInput is set', () => {
    const category = createMockCategory();
    category.directInput = 100;

    expect(isCategoryComplete(category)).toBe(true);
  });

  it('should return true when subcategories have amounts', () => {
    const category = createMockCategory();
    category.subBudgetCategories[0].amount = 100;

    expect(isCategoryComplete(category)).toBe(true);
  });

  it('should return false when directInput is null and no subcategories have amounts', () => {
    const category = createMockCategory();

    expect(isCategoryComplete(category)).toBe(false);
  });

  it('should return false when directInput is null and subcategories array is empty', () => {
    const category = createMockCategory();
    category.directInput = null;
    category.subBudgetCategories = [];

    expect(isCategoryComplete(category)).toBe(false);
  });
});

describe('completionPercentage', () => {
  it('should return 0 when no data', () => {
    expect(completionPercentage(undefined)).toEqual(0);
  });

  it('should calculate 100% for all complete categories', () => {
    const goalCalculation = createMockGoalCalculation([
      { directInput: 0 },
      { directInput: 100 },
      { subCategories: [{ amount: 50 }] },
    ]);

    expect(completionPercentage(goalCalculation)).toEqual(100);
  });

  it('should calculate mixed completion', () => {
    const goalCalculation = createMockGoalCalculation(
      [{ directInput: 0 }, { subCategories: [{ amount: 0 }] }],
      [{ directInput: 100 }],
    );
    goalCalculation.firstName = null;

    // 2 complete categories plus settings out of 5 total categories
    expect(completionPercentage(goalCalculation)).toEqual(60);
  });
});
