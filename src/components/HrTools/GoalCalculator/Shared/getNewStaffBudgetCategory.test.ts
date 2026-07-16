import { gqlMock } from '__tests__/util/graphqlMocking';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import {
  GoalCalculationDocument,
  GoalCalculationQuery,
  GoalCalculationQueryVariables,
} from './GoalCalculation.generated';
import { getNewStaffBudgetCategory } from './getNewStaffBudgetCategory';

// Categories that have no New Staff reference but mirror the user's own entered amount, each seeded
// with a distinct non-zero amount so the test fails if the function returns 0 instead of mirroring.
const mirroredCategories = [
  { category: PrimaryBudgetCategoryEnum.SummerAssignmentExpenses, amount: 100 },
  { category: PrimaryBudgetCategoryEnum.AccountTransfers, amount: 200 },
  {
    category: PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
    amount: 300,
  },
  { category: PrimaryBudgetCategoryEnum.CellPhoneWorkLine, amount: 400 },
  {
    category: PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
    amount: 500,
  },
  { category: PrimaryBudgetCategoryEnum.MinistryOther, amount: 600 },
];

const goalCalculationWithEnteredExpenses = gqlMock<
  GoalCalculationQuery,
  GoalCalculationQueryVariables
>(GoalCalculationDocument, {
  variables: { accountListId: 'account-list-1', id: 'goal-calculation-1' },
  mocks: {
    goalCalculation: {
      ministryFamily: {
        directInput: null,
        primaryBudgetCategories: [
          // US Staff Conference has no reference at all, even when the user entered an amount.
          {
            category: PrimaryBudgetCategoryEnum.UsStaffConference,
            directInput: 700,
            subBudgetCategories: [],
          },
          ...mirroredCategories.map(({ category, amount }) => ({
            category,
            directInput: amount,
            subBudgetCategories: [],
          })),
        ],
      },
    },
  },
}).goalCalculation;

describe('getNewStaffBudgetCategory', () => {
  it('returns 0 when the goal calculation is missing', () => {
    expect(
      getNewStaffBudgetCategory(
        null,
        PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
      ),
    ).toBe(0);
    expect(
      getNewStaffBudgetCategory(
        undefined,
        PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
      ),
    ).toBe(0);
  });

  describe('categories with a new staff reference', () => {
    const goalCalculationWithReference = gqlMock<
      GoalCalculationQuery,
      GoalCalculationQueryVariables
    >(GoalCalculationDocument, {
      variables: { accountListId: 'account-list-1', id: 'goal-calculation-1' },
      mocks: {
        goalCalculation: {
          // Distinct values per field so a swap between any two branches makes the assertion fail
          newStaffCalculations: {
            ministryMiles: 140,
            travel: 55,
            conferences: 210,
            meals: 65,
            mpd: 200,
            supplies: 75,
            medicalExpenses: 365,
          },
        },
      },
    }).goalCalculation;

    it.each([
      {
        category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        expected: 140,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryTravel,
        expected: 55,
      },
      {
        category: PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
        expected: 210,
      },
      {
        category: PrimaryBudgetCategoryEnum.MealsAndPerDiem,
        expected: 65,
      },
      {
        category: PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
        expected: 200,
      },
      {
        category: PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
        expected: 75,
      },
      {
        category: PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses,
        expected: 365,
      },
    ])(
      'sources $category from the backend calculation',
      ({ category, expected }) => {
        expect(
          getNewStaffBudgetCategory(goalCalculationWithReference, category),
        ).toBe(expected);
      },
    );
  });

  describe('categories without a new staff reference', () => {
    it.each(mirroredCategories)(
      'mirrors the entered amount for $category',
      ({ category, amount }) => {
        expect(
          getNewStaffBudgetCategory(
            goalCalculationWithEnteredExpenses,
            category,
          ),
        ).toBe(amount);
      },
    );

    it('has no reference for US Staff Conference even when the user entered an amount', () => {
      expect(
        getNewStaffBudgetCategory(
          goalCalculationWithEnteredExpenses,
          PrimaryBudgetCategoryEnum.UsStaffConference,
        ),
      ).toBe(0);
    });
  });
});
