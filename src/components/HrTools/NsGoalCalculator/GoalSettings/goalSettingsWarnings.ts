import { TFunction } from 'i18next';
import {
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffGoalCalculationSalaryOverCapEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import { GoalSettingsFormValues } from './goalSettingsFormValues';

export type WarningSeverity = 'warning' | 'error';

export interface GoalSettingsWarningItem {
  key: string;
  severity: WarningSeverity;
  message: string;
  /** Fields that feed this warning; they take a matching outline while active. */
  fields: readonly string[];
}

const SALARY_CAP_FIELDS: readonly (keyof GoalSettingsFormValues)[] = [
  'annualRequestedSalary',
  'spouseRequestedAnnualSalary',
  'contribution403bPercentage',
  'spouseContribution403bPercentage',
  // Sets the cost-of-living multiplier, and so the cap itself.
  'geographicLocation',
];

interface BuildWarningsArgs {
  values: GoalSettingsFormValues;
  salaryOverCap: boolean;
  debtOverCap: boolean;
  t: TFunction;
}

type ExemptParty = 'both' | 'staff' | 'spouse';

type PartyFields = Record<
  ExemptParty,
  readonly (keyof GoalSettingsFormValues)[]
>;

const SECA_FIELDS: PartyFields = {
  both: ['secaExempt', 'spouseSecaExempt'],
  staff: ['secaExempt'],
  spouse: ['spouseSecaExempt'],
};

const HEALTHCARE_FIELDS: PartyFields = {
  both: ['healthcareExempt', 'spouseHealthcareExempt'],
  staff: ['healthcareExempt'],
  spouse: ['spouseHealthcareExempt'],
};

/**
 * Who an exemption covers, or `null` for nobody.
 */
const exemptParty = (staff: boolean, spouse: boolean): ExemptParty | null => {
  if (staff && spouse) {
    return 'both';
  }
  if (staff) {
    return 'staff';
  }
  return spouse ? 'spouse' : null;
};

/**
 * Builds the active Goal Settings warnings (NSGC A33 and DA5).
 */
export const buildGoalSettingsWarnings = ({
  values,
  salaryOverCap,
  debtOverCap,
  t,
}: BuildWarningsArgs): GoalSettingsWarningItem[] => {
  const salaryOverCapAllowed =
    values.allowSalaryOverCap !== '' &&
    values.allowSalaryOverCap !== NewStaffGoalCalculationSalaryOverCapEnum.No;

  // Spouse flags only count while there is a spouse; the form can hold a stale
  // one after a marital status change.
  const hasSpouse =
    values.maritalStatus === NewStaffQuestionnaireMaritalStatusEnum.Married;
  const secaParty = exemptParty(
    values.secaExempt === 'true',
    hasSpouse && values.spouseSecaExempt === 'true',
  );
  const healthcareParty = exemptParty(
    values.healthcareExempt === 'true',
    hasSpouse && values.spouseHealthcareExempt === 'true',
  );

  const secaMessages = {
    both: t('Both opted out of SECA'),
    staff: t('Staff opted out of SECA'),
    spouse: t('Spouse opted out of SECA'),
  };
  const healthcareMessages = {
    both: t('Both are healthcare exempt'),
    staff: t('Staff is healthcare exempt'),
    spouse: t('Spouse is healthcare exempt'),
  };

  // DA5 fires on exempt="Both", or exempt="One" with a Single or SOSA status —
  // both of which mean everyone on the plan is exempt.
  const everyoneExempt =
    healthcareParty === 'both' || (!hasSpouse && healthcareParty === 'staff');
  // Discrepancy with the sheet: DA5's plan list has no "Exempt" option, so it
  // never defined this case. Following it literally makes Exempt a violating
  // plan. Revisit with whoever owns the plan list if that reading is wrong.
  const exemptPlanMismatch =
    everyoneExempt &&
    values.benefitsPlan !== '' &&
    values.benefitsPlan !== MpdGoalBenefitsConstantPlanEnum.Select;

  // Only reachable via `everyoneExempt`, which is either both spouses or a lone applicant
  const staffName = values.firstName || t('Staff');
  const spouseName = values.spouseFirstName || t('Spouse');
  const exemptPlanMessage =
    healthcareParty === 'both'
      ? t(
          '{{staffName}} and {{spouseName}} are exempt, so they must have the Select plan',
          { staffName, spouseName },
        )
      : t('{{staffName}} is exempt, so they must have the Select plan', {
          staffName,
        });

  const candidates: (GoalSettingsWarningItem & { active: boolean })[] = [
    {
      key: 'salaryOverCap',
      active: salaryOverCap,
      severity: salaryOverCapAllowed ? 'warning' : 'error',
      message: t('Total salary is over the standard cap'),
      fields: SALARY_CAP_FIELDS,
    },
    {
      key: 'debtOverCap',
      active: debtOverCap,
      severity: values.allowDebtOverCap === 'true' ? 'warning' : 'error',
      message: t('Annual debt is over the standard cap'),
      fields: [],
    },
    {
      key: 'exemptPlan',
      active: exemptPlanMismatch,
      severity: 'error',
      message: exemptPlanMessage,
      fields: [],
    },
    {
      key: 'secaExempt',
      active: secaParty !== null,
      severity: 'warning',
      message: secaParty ? secaMessages[secaParty] : '',
      fields: secaParty ? SECA_FIELDS[secaParty] : [],
    },
    {
      key: 'healthcareExempt',
      active: healthcareParty !== null,
      severity: 'warning',
      message: healthcareParty ? healthcareMessages[healthcareParty] : '',
      fields: healthcareParty ? HEALTHCARE_FIELDS[healthcareParty] : [],
    },
  ];

  return candidates.filter(({ active }) => active);
};

export const getFieldSeverity = (
  warnings: GoalSettingsWarningItem[],
  name: string,
): WarningSeverity | undefined => {
  const severities = warnings
    .filter(({ fields }) => fields.includes(name))
    .map(({ severity }) => severity);

  return severities.find((severity) => severity === 'error') ?? severities[0];
};
