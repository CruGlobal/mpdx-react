import React, { useMemo } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useFormatters } from '../../../Shared/useFormatters';
import { GoalSettingsNumberField } from '../Fields/GoalSettingsNumberField';
import { GoalSettingsSelect, SelectOption } from '../Fields/GoalSettingsSelect';
import { ColumnHeaderRow, FieldRow, Section } from '../GoalSettingsLayout';
import { useGoalSettingsPreview } from '../GoalSettingsPreviewContext';
import { GoalSettingsFormValues } from '../goalSettingsFormValues';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';

export const FinancialInformationSection: React.FC<
  GoalSettingsSectionProps
> = ({
  hasSpouse,
  seniorStaff,
  calculations,
  primaryName,
  spouseName,
  visibleHeaders,
  sharedHeader,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const seniorStaffOnly = t('Senior Staff Only');

  const preview = useGoalSettingsPreview();
  const { contributing403bAmount, spouseContributing403bAmount } =
    preview?.previewCalculations ?? calculations;

  const calculating = preview?.calculating ?? false;

  const {
    values: { calculationsYear },
  } = useFormikContext<GoalSettingsFormValues>();
  // Keep the geographic constants on the same year the goal is calculated with
  const { goalGeographicConstantMap } = useGoalCalculatorConstants(
    calculationsYear ? Number(calculationsYear) : null,
  );

  const geographicLocationOptions = useMemo<SelectOption[]>(
    () =>
      Array.from(goalGeographicConstantMap.keys(), (location) => ({
        value: location,
        label: location,
      })),
    [goalGeographicConstantMap],
  );

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

      <FieldRow
        label={t('403(b) Amount')}
        helperText={t('Calculated monthly amount')}
      >
        <Typography
          variant="body1"
          aria-busy={calculating}
          sx={{ opacity: calculating ? 0.56 : 1 }}
        >
          <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
            {t('403(b) Amount — {{name}}', { name: primaryName })}
          </Box>
          {formatCurrency(contributing403bAmount)}
        </Typography>
        {hasSpouse && (
          <Typography
            variant="body1"
            aria-busy={calculating}
            sx={{ opacity: calculating ? 0.56 : 1 }}
          >
            <Box component="span" sx={visuallyHidden as SxProps<Theme>}>
              {t('403(b) Amount — {{name}}', { name: spouseName })}
            </Box>
            {formatCurrency(spouseContributing403bAmount)}
          </Typography>
        )}
      </FieldRow>

      {seniorStaff && (
        <>
          <FieldRow label={t('MHA Amount')} helperText={seniorStaffOnly}>
            <GoalSettingsNumberField
              name="spouseMhaAmount"
              label={t('MHA Amount')}
              adornment="currency"
            />
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
            />
          </FieldRow>

          <FieldRow label={t('Account Transfers')} helperText={seniorStaffOnly}>
            <GoalSettingsNumberField
              name="accountTransfers"
              label={t('Account Transfers')}
              personName={primaryName}
              adornment="currency"
            />
          </FieldRow>

          <FieldRow label={t('Advocacy')} helperText={seniorStaffOnly}>
            <GoalSettingsNumberField
              name="advocacyTransfers"
              label={t('Advocacy')}
              personName={primaryName}
              adornment="currency"
            />
          </FieldRow>
        </>
      )}

      <ColumnHeaderRow columns={[sharedHeader]} />

      <FieldRow
        label={t('Geographic Location')}
        helperText={t("Determines staff's cost-of-living multiplier")}
      >
        <GoalSettingsSelect
          name="geographicLocation"
          label={t('Geographic Location')}
          options={geographicLocationOptions}
        />
      </FieldRow>

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

      <FieldRow
        label={t('Other Expenses')}
        helperText={t('Additional monthly needs not covered above')}
      >
        <GoalSettingsNumberField
          name="otherExpenses"
          label={t('Other Expenses')}
          adornment="currency"
        />
      </FieldRow>
    </Section>
  );
};
