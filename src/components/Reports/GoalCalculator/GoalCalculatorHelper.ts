export interface GoalCalculatorCategory {
  id: GoalCalculatorCategoryEnum;
  title: string;
  component: JSX.Element;
  rightPanelComponent?: JSX.Element;
}

export interface GoalCalculatorStep {
  title: string;
  id: GoalCalculatorStepEnum;
  categories: GoalCalculatorCategory[];
  icon: JSX.Element;
}

export enum GoalCalculatorStepEnum {
  CalculatorSettings = 'calculator-settings',
  MinistryExpenses = 'ministry-expenses',
  HouseholdExpenses = 'household-expenses',
  SummaryReport = 'summary-report',
}

export enum GoalCalculatorCategoryEnum {
  // CalculatorSettings
  Settings = 'settings',
  Information = 'information',
  SpecialIncome = 'special-income',
  OneTimeGoals = 'one-time-goals',
  // HouseholdExpenses
  Giving = 'giving',
  Saving = 'saving',
  Housing = 'housing',
  Utilities = 'utilities',
  Insurance = 'insurance',
  Debt = 'debt',
  Food = 'food',
  Clothing = 'clothing',
  Transportation = 'transportation',
  MedicalHousehold = 'medical-household',
  Recreational = 'recreational',
  Personal = 'personal',
  // MinistryExpenses
  Mileage = 'mileage',
  Medical = 'medical',
  MPD = 'mpd',
  Transfers = 'transfers',
  Technology = 'technology',
  SummerMissions = 'summer-missions',
  Other = 'other',
  // SummaryReport
  Overview = 'overview',
}
