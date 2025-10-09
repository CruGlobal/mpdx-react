import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import {
  FormattedConstants,
  GoalMiscConstants,
} from 'src/hooks/useGoalCalculatorConstants';
import { ListGoalCalculationFragment } from '../GoalsList/GoalCalculations.generated';
import {
  GoalCalculationQuery,
  GoalCalculationSettingsFragment,
} from './GoalCalculation.generated';
import {
  GoalTotals,
  calculateCategoryEnumTotal,
  calculateFinalGoalTotals,
  hasStaffSpouse,
} from './calculateTotals';

const BASE_SALARY = 28500;
const LEVEL_1_RATE = 1 / 1.4;
const LEVEL_2_RATE = 0.85;

const TENURE_INCREASES = [
  { years: 0, adjustment: 0 },
  { years: 5, adjustment: 1400 },
  { years: 10, adjustment: 2100 },
  { years: 15, adjustment: 2800 },
  { years: 20, adjustment: 3500 },
  { years: 25, adjustment: 4200 },
  { years: 30, adjustment: 4900 },
  { years: 35, adjustment: 5600 },
  { years: 40, adjustment: 6300 },
  { years: 45, adjustment: 7000 },
];
const getTenureIncrease = (tenure: number) =>
  TENURE_INCREASES.findLast(({ years }) => years <= tenure)?.adjustment ?? 0;

const numDependents = (
  familySize: MpdGoalBenefitsConstantSizeEnum | null | undefined,
): number => {
  switch (familySize) {
    case MpdGoalBenefitsConstantSizeEnum.Single:
    case MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren:
      return 0;
    case MpdGoalBenefitsConstantSizeEnum.SosaOneDependent:
    case MpdGoalBenefitsConstantSizeEnum.MarriedOneToTwoChildren:
      return 1;
    case MpdGoalBenefitsConstantSizeEnum.SosaTwoToThreeDependents:
      return 2;
    case MpdGoalBenefitsConstantSizeEnum.MarriedThreeOrMoreChildren:
      return 3;
    case MpdGoalBenefitsConstantSizeEnum.SosaFourOrMoreDependents:
      return 4;

    default:
      return 0;
  }
};

/**
 * These values are the "Under 30" column of 'Data Tables'!C55:G63.
 * The other columns are calculated by adding either 0.3 (for single/SOSA staff) or 0.1 for each
 * column you move right.
 **/
const FAMILY_SIZE_BASE_SALARY = {
  single: 0.4,
  married: 0.4,
  1: 0.6,
  2: 0.8,
  3: 0.85,
  4: 0.9,
  5: 0.95,
  6: 1.0,
} as const;

/** The only ages taken into consideration are under 30 and 40+ */
const AGE_COLUMNS: Record<GoalCalculationAge, number> = {
  [GoalCalculationAge.UnderThirty]: 0,
  [GoalCalculationAge.ThirtyToThirtyFour]: 0,
  [GoalCalculationAge.ThirtyFiveToThirtyNine]: 0,
  [GoalCalculationAge.OverForty]: 3,
};

const getBaseMultiplier = (goalCalculation: GoalCalculation): number => {
  const single = !hasStaffSpouse(goalCalculation?.familySize);

  let baseSalary = FAMILY_SIZE_BASE_SALARY.single;
  if (!single) {
    const children = numDependents(goalCalculation?.familySize);
    if (children === 0) {
      baseSalary = FAMILY_SIZE_BASE_SALARY.married;
    } else {
      baseSalary = FAMILY_SIZE_BASE_SALARY[Math.min(children, 6)];
    }
  }

  const ageIncrement = single ? 0.3 : 0.1;
  const ageColumn = goalCalculation?.age ? AGE_COLUMNS[goalCalculation.age] : 0;
  return baseSalary + ageIncrement * ageColumn;
};

const getUncappedBase = (
  goalCalculation: GoalCalculation,
  yearsOnStaff: number,
  constants: FormattedConstants,
): number => {
  const single = !hasStaffSpouse(goalCalculation?.familySize);
  const debtPercentage = single
    ? (constants.goalMiscConstants.DEBT_PERCENTAGE?.SINGLE?.fee ?? 0)
    : (constants.goalMiscConstants.DEBT_PERCENTAGE?.MARRIED?.fee ?? 0);
  const debtCapPercentage =
    0.8 * (LEVEL_2_RATE / LEVEL_1_RATE) * debtPercentage;

  const baseMultiplier = getBaseMultiplier(goalCalculation);
  const geographicMultiplier =
    (typeof goalCalculation?.geographicLocation === 'string'
      ? constants.goalGeographicConstantMap.get(
          goalCalculation.geographicLocation,
        )
      : null) ?? 0;
  const tenureIncrease = getTenureIncrease(yearsOnStaff);
  const base = BASE_SALARY * LEVEL_1_RATE * (1 + baseMultiplier);
  const monthlyDebt = 0; // TODO: Use monthly debt when implementing New Staff Goals
  const debtCap = (base + tenureIncrease) * debtCapPercentage;
  const annualDebtSalary = Math.min(
    (monthlyDebt * 12) / (single ? 1 : 2),
    debtCap,
  );
  return (geographicMultiplier + 1) * base + tenureIncrease + annualDebtSalary;
};

const getSalaryCap = (
  goalCalculation: GoalCalculation,
  constants: FormattedConstants,
): number => {
  const miscConstants = constants.goalMiscConstants;
  const married = hasStaffSpouse(goalCalculation?.familySize);

  if (goalCalculation?.geographicLocation === 'New York City') {
    return married
      ? (miscConstants.BOARD_APPROVED_SALARY_CALC?.MARRIED_NY?.fee ?? 0)
      : (miscConstants.BOARD_APPROVED_SALARY_CALC?.SINGLE_NY?.fee ?? 0);
  }

  return married
    ? (miscConstants.BOARD_APPROVED_SALARY_CALC?.MARRIED_OTHER?.fee ?? 0)
    : (miscConstants.BOARD_APPROVED_SALARY_CALC?.SINGLE_OTHER?.fee ?? 0);
};

const REIMBURSEMENT_AMOUNTS: Record<MpdGoalBenefitsConstantPlanEnum, number> = {
  [MpdGoalBenefitsConstantPlanEnum.Select]: 100,
  [MpdGoalBenefitsConstantPlanEnum.Plus]: 130,
  [MpdGoalBenefitsConstantPlanEnum.Base]: 165,
  [MpdGoalBenefitsConstantPlanEnum.Minimum]: 200,
  [MpdGoalBenefitsConstantPlanEnum.Exempt]: 0,
};

const MINISTRY_CATEGORIES = [
  PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
  PrimaryBudgetCategoryEnum.MinistryTravel,
  PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences,
  PrimaryBudgetCategoryEnum.MealsAndPerDiem,
  PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
  PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
  PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense,
  PrimaryBudgetCategoryEnum.UsStaffConference,
  PrimaryBudgetCategoryEnum.AccountTransfers,
  PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
  PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
  PrimaryBudgetCategoryEnum.CreditCardProcessingCharges,
  PrimaryBudgetCategoryEnum.SummerAssignmentExpenses,
  PrimaryBudgetCategoryEnum.SummerAssignmentTravel,
  PrimaryBudgetCategoryEnum.MinistryOther,
];

type GoalCalculation =
  | GoalCalculationQuery['goalCalculation']
  | null
  | undefined;

export const calculateNewStaffGoalTotals = (
  goalCalculation: GoalCalculation,
  constants: FormattedConstants,
): GoalTotals => {
  const married = hasStaffSpouse(goalCalculation?.familySize);
  const uncappedBase = getUncappedBase(
    goalCalculation,
    goalCalculation?.yearsOnStaff ?? 0,
    constants,
  );
  const spouseUncappedBase = married
    ? getUncappedBase(
        goalCalculation,
        goalCalculation?.spouseYearsOnStaff ?? 0,
        constants,
      )
    : 0;
  const totalUncappedBase = uncappedBase + spouseUncappedBase;

  const salaryCap = getSalaryCap(goalCalculation, constants);
  // If the combined salary exceeds the cap, weight each spouse's salaries so that they will add
  // up to salaryCap
  const cappedMultiplier = Math.min(salaryCap / totalUncappedBase, 1);
  const cappedBase = uncappedBase * cappedMultiplier;
  const spouseCappedBase = spouseUncappedBase * cappedMultiplier;
  const netMonthlySalary = (cappedBase + spouseCappedBase) / 12;

  const miscConstants = constants.goalMiscConstants;
  const ministryExpensesTotal = MINISTRY_CATEGORIES.reduce((sum, category) => {
    const categoryTotal = getNewStaffBudgetCategory(
      goalCalculation,
      category,
      miscConstants,
    );
    return sum + categoryTotal;
  }, 0);

  return calculateFinalGoalTotals({
    constants,
    goalCalculation,
    monthlyBudget: netMonthlySalary,
    netMonthlySalary,
    taxesPercentage: miscConstants.RATES?.SECA?.fee ?? 0,
    rothContributionPercentage: miscConstants.RATES?.FOUR_OH_THREE_B?.fee ?? 0,
    traditionalContributionPercentage: 0,
    ministryExpensesTotal,
  });
};

interface Multipliers {
  mileage: number;
  travel: number;
  conference: number;
  meals: number;
  mpd: number;
  supplies: number;
}

const SINGLE_EXPENSES: Multipliers = {
  mileage: 200,
  travel: 30,
  conference: 100,
  meals: 50,
  mpd: 125,
  supplies: 50,
};

const FAMILY_MULTIPLIERS = [
  {
    children: 0,
    multipliers: {
      mileage: 1,
      travel: 2,
      conference: 2,
      meals: 2,
      mpd: 1.5,
      supplies: 1.5,
    },
  },
  {
    children: 1,
    multipliers: {
      mileage: 1,
      travel: 3,
      conference: 2.1,
      meals: 3,
      mpd: 1.6,
      supplies: 1.5,
    },
  },
  {
    children: 2,
    multipliers: {
      mileage: 1,
      travel: 4,
      conference: 2.2,
      meals: 3,
      mpd: 1.7,
      supplies: 1.5,
    },
  },
  {
    children: 3,
    multipliers: {
      mileage: 1,
      travel: 5,
      conference: 2.3,
      meals: 3,
      mpd: 1.8,
      supplies: 1.5,
    },
  },
  {
    children: 4,
    multipliers: {
      mileage: 1,
      travel: 6,
      conference: 2.4,
      meals: 3,
      mpd: 1.9,
      supplies: 1.5,
    },
  },
  {
    children: 5,
    multipliers: {
      mileage: 1,
      travel: 7,
      conference: 2.5,
      meals: 3,
      mpd: 2,
      supplies: 1.5,
    },
  },
  {
    children: 6,
    multipliers: {
      mileage: 1,
      travel: 8,
      conference: 2.6,
      meals: 3,
      mpd: 2.1,
      supplies: 1.5,
    },
  },
];

const OFFICE_MULTIPLIERS: Multipliers = {
  mileage: 0.5,
  travel: 1,
  conference: 0.25,
  meals: 0.5,
  mpd: 1,
  supplies: 1,
};

const getExpenseAmount = (
  goalCalculation: GoalCalculationSettingsFragment,
  field: keyof Multipliers,
): number => {
  let amount = SINGLE_EXPENSES[field];

  if (hasStaffSpouse(goalCalculation.familySize)) {
    const children = numDependents(goalCalculation.familySize);
    const familyMultiplier =
      FAMILY_MULTIPLIERS.findLast(
        (multiplier) => multiplier.children <= children,
      )?.multipliers[field] ?? 1;
    amount *= familyMultiplier;
  }

  if (goalCalculation.role === GoalCalculationRole.Office) {
    amount *= OFFICE_MULTIPLIERS[field];
  }

  return amount;
};

export const getNewStaffBudgetCategory = (
  goalCalculation: ListGoalCalculationFragment | null | undefined,
  category: PrimaryBudgetCategoryEnum,
  miscConstants: GoalMiscConstants,
): number => {
  if (!goalCalculation) {
    return 0;
  }

  switch (category) {
    case PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage:
      const mileageRate = miscConstants?.MILEAGE_RATES?.GENERAL?.fee ?? 0;
      return getExpenseAmount(goalCalculation, 'mileage') * mileageRate;
    case PrimaryBudgetCategoryEnum.MinistryTravel:
      return getExpenseAmount(goalCalculation, 'travel');
    case PrimaryBudgetCategoryEnum.MeetingsRetreatsConferences:
      return getExpenseAmount(goalCalculation, 'conference');
    case PrimaryBudgetCategoryEnum.MealsAndPerDiem:
      return getExpenseAmount(goalCalculation, 'meals');
    case PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment:
      return getExpenseAmount(goalCalculation, 'mpd');
    case PrimaryBudgetCategoryEnum.SuppliesAndMaterials:
      return getExpenseAmount(goalCalculation, 'supplies');

    case PrimaryBudgetCategoryEnum.ReimbursableMedicalExpense:
      if (!goalCalculation.benefitsPlan) {
        return 0;
      }
      const spouses = hasStaffSpouse(goalCalculation.familySize) ? 2 : 1;
      return REIMBURSEMENT_AMOUNTS[goalCalculation.benefitsPlan] * spouses;

    case PrimaryBudgetCategoryEnum.UsStaffConference:
    case PrimaryBudgetCategoryEnum.AccountTransfers:
    case PrimaryBudgetCategoryEnum.InternetServiceProviderFee:
    case PrimaryBudgetCategoryEnum.CellPhoneWorkLine:
    case PrimaryBudgetCategoryEnum.CreditCardProcessingCharges:
    case PrimaryBudgetCategoryEnum.SummerAssignmentExpenses:
    case PrimaryBudgetCategoryEnum.SummerAssignmentTravel:
    case PrimaryBudgetCategoryEnum.MinistryOther:
      return calculateCategoryEnumTotal(
        goalCalculation.ministryFamily,
        category,
      );

    default:
      return 0;
  }
};
