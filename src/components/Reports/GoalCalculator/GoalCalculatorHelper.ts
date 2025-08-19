import React from 'react';

export interface GoalCalculatorCategory {
  id: GoalCalculatorCategoryEnum;
  title: string;
  subtitle?: string;
  component?: JSX.Element;
  rightPanelComponent?: JSX.Element;
}

export interface GoalCalculatorStep {
  id: GoalCalculatorStepEnum;
  title: string;
  instructions?: JSX.Element;
  PageComponent?: React.FC;
  categories?: GoalCalculatorCategory[];
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
  OtherHousehold = 'other-household',
  // MinistryExpenses
  MinistryMileage = 'ministry-mileage',
  MedicalMileage = 'medical-mileage',
  MedicalExpenses = 'medical-expenses',
  MinistryPartnerDevelopment = 'ministry-partner-development',
  Communications = 'communications',
  Entertainment = 'entertainment',
  StaffDevelopment = 'staff-development',
  Supplies = 'supplies',
  Technology = 'technology',
  Travel = 'travel',
  Transfers = 'transfers',
  OtherMinistry = 'other-ministry',
  // SummaryReport
  Overview = 'overview',
}

export enum GoalCalculatorReportEnum {
  MpdGoal = 'mpd-goal',
  SalaryRequest = 'salary-request',
  PresentingYourGoal = 'presenting-your-goal',
}
