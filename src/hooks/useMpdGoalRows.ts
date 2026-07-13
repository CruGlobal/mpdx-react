import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/HrTools/GoalCalculator/Shared/GoalCalculatorContext';
import {
  calculateNewStaffGoalTotals,
  getNewStaffBudgetCategory,
} from 'src/components/HrTools/GoalCalculator/Shared/calculateNewStaffTotals';
import {
  GoalTotals,
  calculateCategoryEnumTotal,
} from 'src/components/HrTools/GoalCalculator/Shared/calculateTotals';
import { safeProgressRatio } from 'src/components/HrTools/Shared/helpers/safeProgressRatio';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalCalculatorConstants } from './useGoalCalculatorConstants';
import { useLocale } from './useLocale';

export interface MpdGoalRow {
  line: string;
  category: string;
  amount: number;
  reference: number;
  percentage?: boolean;
}

export const useMpdGoalRows = (supportRaised: number) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { goalCalculationResult, goalTotals } = useGoalCalculator();
  const constants = useGoalCalculatorConstants();
  const { goalMiscConstants } = constants;

  const valueFormatter = useCallback(
    (value: number, row: MpdGoalRow) =>
      row.percentage
        ? percentageFormat(value, locale, { fractionDigits: 2 })
        : currencyFormat(value, 'USD', locale, { fractionDigits: 0 }),
    [locale],
  );

  const newStaffReference = useMemo(
    () =>
      calculateNewStaffGoalTotals(
        goalCalculationResult.data?.goalCalculation ?? null,
        constants,
      ),
    [goalCalculationResult, constants],
  );

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const rows = useMemo((): MpdGoalRow[] => {
    const ministryExpenseCategories = [
      {
        line: '3A',
        category: t('Ministry Miles'),
        categories: [PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage],
      },
      {
        line: '3B',
        category: t('Ministry Travel'),
        categories: [PrimaryBudgetCategoryEnum.MinistryTravel],
      },
      {
        line: '3C',
        category: t('Meetings, Retreats, Conferences'),
        categories: [
          PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
          PrimaryBudgetCategoryEnum.UsStaffConference,
        ],
      },
      {
        line: '3D',
        category: t('Meals and Per Diem'),
        categories: [PrimaryBudgetCategoryEnum.MealsAndPerDiem],
      },
      {
        line: '3E',
        category: t('MPD'),
        categories: [PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment],
      },
      {
        line: '3F',
        category: t('Supplies and Materials'),
        categories: [PrimaryBudgetCategoryEnum.SuppliesAndMaterials],
      },
      {
        line: '3G',
        category: t('Summer Assignment Expenses'),
        categories: [PrimaryBudgetCategoryEnum.SummerAssignmentExpenses],
      },
      {
        line: '3H',
        category: t('Reimbursable Medical Expenses'),
        categories: [PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses],
      },
      {
        line: '3I',
        category: t(
          'Account transfers to staff members, ministries, projects, etc.',
        ),
        categories: [PrimaryBudgetCategoryEnum.AccountTransfers],
      },
      {
        line: '3J',
        category: t('Other (includes credit card charges)'),
        categories: [
          PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
          PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
          PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
          PrimaryBudgetCategoryEnum.MinistryOther,
        ],
      },
    ];
    const ministryExpenseRows = ministryExpenseCategories.map(
      ({ categories, ...rowFields }): MpdGoalRow => ({
        ...rowFields,
        amount: categories.reduce(
          (sum, category) =>
            sum +
            calculateCategoryEnumTotal(
              goalCalculation?.ministryFamily,
              category,
            ),
          0,
        ),
        reference: categories.reduce(
          (sum, category) =>
            sum +
            getNewStaffBudgetCategory(
              goalCalculation,
              category,
              goalMiscConstants,
            ),
          0,
        ),
      }),
    );

    // The rows can have an amount and reference value, or a value function that calculates the
    // amount and reference value from the goal total and new staff goal total
    const rows: Array<
      | MpdGoalRow
      | (Omit<MpdGoalRow, 'amount' | 'reference'> & {
          value: (goalTotals: GoalTotals) => number;
        })
    > = [
      {
        line: '1A',
        category: t('Net Monthly Combined Salary'),
        value: (goalTotals) => goalTotals.netMonthlySalary,
      },
      {
        line: '1B',
        category: t('Taxes, SECA, VTL, etc. %'),
        value: (goalTotals) => goalTotals.taxesPercentage,
        percentage: true,
      },
      {
        line: '1C',
        category: t('Taxes, SECA, VTL, etc.'),
        value: (goalTotals) => goalTotals.taxes,
      },
      {
        line: '1D',
        category: t('Subtotal with Net, Taxes, and SECA'),
        value: (goalTotals) => goalTotals.salaryPreIra,
      },
      {
        line: '1E',
        category: t('Roth 403(b) Contribution %'),
        value: (goalTotals) => goalTotals.rothContributionPercentage,
        percentage: true,
      },
      {
        line: '1F',
        category: t('Traditional 403(b) Contribution %'),
        value: (goalTotals) => goalTotals.traditionalContributionPercentage,
        percentage: true,
      },
      {
        line: '1G',
        category: t('100% - (Roth + Traditional 403(b)) %'),
        value: (goalTotals) =>
          1 -
          goalTotals.rothContributionPercentage -
          goalTotals.traditionalContributionPercentage,
        percentage: true,
      },
      {
        line: '1H',
        category: t('Roth 403(b)'),
        value: (goalTotals) => goalTotals.rothContribution,
      },
      {
        line: '1I',
        category: t('Traditional 403(b)'),
        value: (goalTotals) => goalTotals.traditionalContribution,
      },
      {
        line: '1J',
        category: t('Gross Annual Salary'),
        value: (goalTotals) => goalTotals.grossAnnualSalary,
      },
      {
        line: '1',
        category: t('Gross Monthly Salary'),
        value: (goalTotals) => goalTotals.grossMonthlySalary,
      },
      {
        line: '2',
        category: t('Benefits'),
        value: (goalTotals) => goalTotals.benefitsCharge,
      },
      ...ministryExpenseRows,
      {
        line: '3',
        category: t('Ministry Expenses Subtotal'),
        value: (goalTotals) =>
          goalTotals.ministryExpensesTotal + goalTotals.benefitsCharge,
      },
      {
        line: '4',
        category: t('Subtotal'),
        value: (goalTotals) => goalTotals.overallSubtotal,
      },
      {
        line: '5',
        category: t('Subtotal with {{admin}} admin charge', {
          admin: percentageFormat(
            goalMiscConstants.RATES?.ADMIN_RATE?.fee ?? 0,
            locale,
          ),
        }),
        value: (goalTotals) => goalTotals.overallSubtotalWithAdmin,
      },
      {
        line: '6',
        category: t('Total Goal (line 5 with {{attrition}} attrition)', {
          attrition: percentageFormat(
            goalMiscConstants.RATES?.ATTRITION_RATE?.fee ?? 0,
            locale,
          ),
        }),
        value: (goalTotals) => goalTotals.overallTotal,
      },
      {
        line: '7',
        category: t('Solid Monthly Support Developed'),
        value: () => supportRaised,
      },
      {
        line: '8',
        category: t('Monthly Support to be Developed'),
        value: (goalTotals) => goalTotals.overallTotal - supportRaised,
      },
      {
        line: '9',
        category: t('Support Goal Percentage Progress'),
        value: (goalTotals) =>
          safeProgressRatio(supportRaised, goalTotals.overallTotal),
        percentage: true,
      },
    ];

    return rows.map((row) => {
      if ('value' in row) {
        return {
          ...row,
          amount: row.value(goalTotals),
          reference: row.value(newStaffReference),
        };
      }

      return row;
    });
  }, [
    t,
    goalCalculation,
    goalTotals,
    goalMiscConstants,
    newStaffReference,
    supportRaised,
  ]);

  return { rows, valueFormatter };
};
