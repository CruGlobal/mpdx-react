import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from 'src/components/HrTools/GoalCalculator/Shared/GoalCalculatorContext';
import {
  GoalTotals,
  calculateCategoryEnumTotal,
  calculateGoalSubtotals,
} from 'src/components/HrTools/GoalCalculator/Shared/calculateTotals';
import { getNewStaffBudgetCategory } from 'src/components/HrTools/GoalCalculator/Shared/getNewStaffBudgetCategory';
import { safeProgressRatio } from 'src/components/HrTools/Shared/helpers/safeProgressRatio';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useGoalCalculatorConstants } from './useGoalCalculatorConstants';
import { useLocale } from './useLocale';

export const isBoldLine = (line: string) => ['1J', '6', '8'].includes(line);
export const isTopBorderLine = (line: string) => ['1', '6'].includes(line);
export const isIndentedLine = (line: string) => /[a-z]/i.test(line);

export interface MpdGoalRow {
  line: string;
  category: string;
  amount: number;
  reference: number;
  percentage?: boolean;
}

interface MinistryExpenseLine {
  /** Worksheet line number (3A–3J). */
  line: string;
  /** The budget categories this line aggregates. */
  categories: PrimaryBudgetCategoryEnum[];
}

// The ministry-expense lines (worksheet 3A–3J) and the categories each one aggregates. This is the
// single source of truth: both the per-line reference amounts (lines 3A–3J) and the reference
// subtotal (line 4) are derived from it, so the subtotal cannot silently drift from the displayed
// lines. Labels are attached in the hook (below) so they stay extractable by i18n tooling.
const ministryExpenseLines: MinistryExpenseLine[] = [
  {
    line: '3A',
    categories: [PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage],
  },
  { line: '3B', categories: [PrimaryBudgetCategoryEnum.MinistryTravel] },
  {
    line: '3C',
    categories: [
      PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
      PrimaryBudgetCategoryEnum.UsStaffConference,
    ],
  },
  { line: '3D', categories: [PrimaryBudgetCategoryEnum.MealsAndPerDiem] },
  {
    line: '3E',
    categories: [PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment],
  },
  { line: '3F', categories: [PrimaryBudgetCategoryEnum.SuppliesAndMaterials] },
  {
    line: '3G',
    categories: [PrimaryBudgetCategoryEnum.SummerAssignmentExpenses],
  },
  {
    line: '3H',
    categories: [PrimaryBudgetCategoryEnum.ReimbursableMedicalExpenses],
  },
  { line: '3I', categories: [PrimaryBudgetCategoryEnum.AccountTransfers] },
  {
    line: '3J',
    categories: [
      PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
      PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
      PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
      PrimaryBudgetCategoryEnum.MinistryOther,
    ],
  },
];

// Derived so it can never diverge from the lines rendered on the table.
const newStaffMinistryCategories: PrimaryBudgetCategoryEnum[] =
  ministryExpenseLines.flatMap((line) => line.categories);

export const useMpdGoalRows = (supportRaised: number) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { goalCalculationResult, goalTotals } = useGoalCalculator();
  const { goalMiscConstants } = useGoalCalculatorConstants();

  const valueFormatter = useCallback(
    (value: number, row: MpdGoalRow) =>
      row.percentage
        ? percentageFormat(value, locale, { fractionDigits: 2 })
        : currencyFormat(value, 'USD', locale, { fractionDigits: 0 }),
    [locale],
  );

  const newStaffReference = useMemo<GoalTotals>(() => {
    const goalCalculation = goalCalculationResult.data?.goalCalculation;
    const calculations = goalCalculation?.newStaffCalculations;

    const grossMonthlySalary = calculations?.totalSalary ?? 0;
    const benefitsCharge = calculations?.benefitsCharge ?? 0;

    // Sum the ministry-expense lines from the per-category references (reimbursable medical
    // included) so the reference subtotals foot against the amounts shown on lines 3A–3J.
    const ministryExpensesTotal = newStaffMinistryCategories.reduce(
      (sum, category) =>
        sum + getNewStaffBudgetCategory(goalCalculation, category),
      0,
    );

    return {
      monthlyBudget: calculations?.salary ?? 0,
      netMonthlySalary: calculations?.salary ?? 0,
      taxesPercentage: calculations?.secaRate ?? 0,
      taxes: calculations?.seca ?? 0,
      salaryPreIra: calculations?.salarySubtotal ?? 0,
      rothContributionPercentage: calculations?.contribution403bPercentage ?? 0,
      traditionalContributionPercentage: 0,
      rothContribution: calculations?.totalContributing403bAmount ?? 0,
      traditionalContribution: 0,
      // The client-entered categories above are folded into ministryExpensesTotal, so the server's
      // goal subtotal (which excludes them) is no longer accurate. Re-calculate the totals client-side.
      ...calculateGoalSubtotals({
        grossMonthlySalary,
        ministryExpensesTotal,
        benefitsCharge,
        adminRate: calculations?.adminRate ?? 0,
        attritionRate: calculations?.attritionRate ?? 0,
      }),
    };
  }, [goalCalculationResult.data]);

  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const rows = useMemo((): MpdGoalRow[] => {
    // Labels for lines 3A–3J. Kept as literal t() calls (not a dynamic key) so i18n extraction can
    // find them; the categories each line aggregates live in the shared `ministryExpenseLines`.
    const ministryExpenseLabels: Record<string, string> = {
      '3A': t('Ministry Miles'),
      '3B': t('Ministry Travel'),
      '3C': t('Meetings, Retreats, Conferences'),
      '3D': t('Meals and Per Diem'),
      '3E': t('MPD'),
      '3F': t('Supplies and Materials'),
      '3G': t('Summer Assignment Expenses'),
      '3H': t('Reimbursable Medical Expenses'),
      '3I': t('Account transfers to staff members, ministries, projects, etc.'),
      '3J': t('Other (includes credit card charges)'),
    };
    const ministryExpenseRows = ministryExpenseLines.map(
      ({ line, categories }): MpdGoalRow => ({
        line,
        category: ministryExpenseLabels[line],
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
            sum + getNewStaffBudgetCategory(goalCalculation, category),
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
    locale,
    goalCalculation,
    goalTotals,
    goalMiscConstants,
    newStaffReference,
    supportRaised,
  ]);

  return { rows, valueFormatter };
};
