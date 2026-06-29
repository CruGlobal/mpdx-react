import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const FinancialInformationSection: React.FC<
  GoalSettingsSectionProps
> = ({
  hasSpouse,
  primaryName,
  spouseName,
  visibleHeaders,
  sharedHeader,
  options,
}) => {
  const { t } = useTranslation();
  const seniorStaffOnly = t('Senior Staff Only');

  return (
    <Section title={t('Financial Information')}>
      <ColumnHeaderRow columns={visibleHeaders} />

      <FieldRow label={t('Annual Requested Salary')}>
        <GoalSettingsNumberField
          name="annualRequestedSalary"
          label={t('Annual Requested Salary')}
          personName={primaryName}
          adornment="currency"
        />
        {hasSpouse && (
          <GoalSettingsNumberField
            name="spouseRequestedAnnualSalary"
            label={t('Annual Requested Salary')}
            personName={spouseName}
            adornment="currency"
          />
        )}
      </FieldRow>

      <FieldRow label={t('403(b) Contribution')}>
        <GoalSettingsNumberField
          name="contribution403bPercentage"
          label={t('403(b) Contribution')}
          personName={primaryName}
          adornment="percentage"
        />
        {hasSpouse && (
          <GoalSettingsNumberField
            name="spouseContribution403bPercentage"
            label={t('403(b) Contribution')}
            personName={spouseName}
            adornment="percentage"
          />
        )}
      </FieldRow>

      <FieldRow label={t('MHA')} helperText={seniorStaffOnly}>
        <GoalSettingsNumberField
          name="mhaAmount"
          label={t('MHA')}
          personName={primaryName}
          adornment="currency"
          disabled
        />
        {hasSpouse && (
          <GoalSettingsNumberField
            name="spouseMhaAmount"
            label={t('MHA')}
            personName={spouseName}
            adornment="currency"
            disabled
          />
        )}
      </FieldRow>

      <FieldRow
        label={t('Staff Conference Transfer')}
        helperText={seniorStaffOnly}
      >
        <GoalSettingsNumberField
          name="staffConferenceTransfer"
          label={t('Staff Conference Transfer')}
          personName={primaryName}
          adornment="currency"
          disabled
        />
      </FieldRow>

      <FieldRow label={t('Account Transfers')} helperText={seniorStaffOnly}>
        <GoalSettingsNumberField
          name="accountTransfers"
          label={t('Account Transfers')}
          personName={primaryName}
          adornment="currency"
          disabled
        />
      </FieldRow>

      <FieldRow label={t('Advocacy')} helperText={seniorStaffOnly}>
        <GoalSettingsNumberField
          name="advocacyTransfers"
          label={t('Advocacy')}
          personName={primaryName}
          adornment="currency"
          disabled
        />
      </FieldRow>

      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow label={t('Geo Multiplier')}>
        <GoalSettingsSelect
          name="geographicLocation"
          label={t('Geo Multiplier')}
          options={options.geographicLocation}
        />
      </FieldRow>

      {/* The API splits debt into three monthly payments (no single field). */}
      <FieldRow label={t('Student Loan Payment')}>
        <GoalSettingsNumberField
          name="studentLoanMonthlyPayment"
          label={t('Student Loan Payment')}
          adornment="currency"
        />
      </FieldRow>

      <FieldRow label={t('Car Loan Payment')}>
        <GoalSettingsNumberField
          name="carLoanMonthlyPayment"
          label={t('Car Loan Payment')}
          adornment="currency"
        />
      </FieldRow>

      <FieldRow label={t('Credit Card Payment')}>
        <GoalSettingsNumberField
          name="creditCardDebtMonthlyPayment"
          label={t('Credit Card Payment')}
          adornment="currency"
        />
      </FieldRow>

      <FieldRow label={t('Solid Support Raised')}>
        <GoalSettingsNumberField
          name="solidSupportRaised"
          label={t('Solid Support Raised')}
          adornment="currency"
        />
      </FieldRow>
    </Section>
  );
};
