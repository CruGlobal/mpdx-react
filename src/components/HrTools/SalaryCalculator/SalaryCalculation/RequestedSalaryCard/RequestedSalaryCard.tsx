import React, { useEffect, useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Alert,
  Box,
  CardContent,
  CardHeader,
  Link,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { useAutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import {
  CalculationFieldsFragment,
  useEffectiveSalaryCalculationQuery,
} from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import { EffectiveDateNote } from '../../Shared/EffectiveDateNote';
import { StepCard, StepTableHead } from '../../Shared/StepCard';
import { orientSalaryRequest } from '../../Shared/orientSalaryRequest';
import { useCaps } from '../useCaps';
import { useSosaBlockOverCap } from '../useSosaBlockOverCap';

/**
 * Estimate a person's requested salary from their current HCM gross salary by reversing the
 * requested salary -> gross calculation: gross = salary * (1 + SECA fraction) / non-403b fraction.
 * Used when there is no approved salary request on file, such as a person's first request in MPDX.
 */
export const estimateRequestedSalary = (
  grossSalary: number | null | undefined,
  calculations: CalculationFieldsFragment | null | undefined,
): number | null => {
  if (!grossSalary || !calculations) {
    return null;
  }

  return Math.round(
    (grossSalary * calculations.non403bFraction) /
      (1 + calculations.secaEstimatedFraction),
  );
};

export const RequestedSalaryCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    calculation: salaryCalculation,
    hcmUser,
    hcmSpouse,
  } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();
  const locale = useLocale();
  const { overCapPerson } = useCaps();
  const { isUserSosa, blockOnCap } = useSosaBlockOverCap();
  const { markValid, markInvalid } = useAutosaveForm();

  const { data: effectiveData } = useEffectiveSalaryCalculationQuery();
  const { salary, spouseSalary } =
    orientSalaryRequest(
      effectiveData?.salaryRequest,
      hcmUser?.staffInfo.personNumber,
    ) ?? {};

  // Without an approved salary request, fall back to an estimate based on the current HCM salary
  const estimatedSalary =
    salary ??
    estimateRequestedSalary(
      hcmUser?.currentSalary.grossSalaryAmount,
      salaryCalculation?.calculations,
    );
  const estimatedSpouseSalary =
    spouseSalary ??
    estimateRequestedSalary(
      hcmSpouse?.currentSalary.grossSalaryAmount,
      salaryCalculation?.spouseCalculations,
    );
  const renderCurrentSalary = (
    requested: number | null | undefined,
    estimated: number | null,
  ) => {
    if (requested) {
      return formatCurrency(requested);
    }
    if (!estimated) {
      return '–';
    }
    return (
      <>
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          {/* No cents, since this is an estimate and not an exact amount */}
          {currencyFormat(estimated, 'USD', locale, { fractionDigits: 0 })}
          <Tooltip
            title={t(
              'We could not find an approved salary request on file, so this is our best estimate based on your current salary and 403(b) contributions in HCM. Please check your current salary in HCM to confirm it.',
            )}
            arrow
          >
            <InfoIcon
              fontSize="small"
              color="action"
              data-testid="RequestedSalaryCard-estimateIcon"
            />
          </Tooltip>
        </Box>
        <Typography variant="caption" color="textSecondary" display="block">
          {t('Estimate - confirm in HCM')}
        </Typography>
      </>
    );
  };

  // Disable the Continue button while the saved gross exceeds the SOSA cap.
  useEffect(() => {
    if (blockOnCap) {
      markInvalid('over-cap');
    } else {
      markValid('over-cap');
    }
    return () => markValid('over-cap');
  }, [blockOnCap, markValid, markInvalid]);

  const minimumSalaryValue =
    salaryCalculation?.calculations.minimumRequestedSalary;
  const spouseMinimumSalaryValue =
    salaryCalculation?.spouseCalculations?.minimumRequestedSalary;

  const minimumSalary = formatCurrency(minimumSalaryValue);
  const spouseMinimumSalary = formatCurrency(spouseMinimumSalaryValue);

  const renderFormula = (
    calculations: CalculationFieldsFragment | null | undefined,
  ) =>
    t('MHA + {{ min }} - SECA', {
      min: formatCurrency(calculations?.minimumRequiredSalary),
    });
  const formula = renderFormula(salaryCalculation?.calculations);
  const spouseFormula = renderFormula(salaryCalculation?.spouseCalculations);

  const schema = useMemo(
    () =>
      yup.object({
        salary: amount(t('Requested salary'), t, {
          required: true,
          min: minimumSalaryValue,
          minMessage: t('Requested salary must be at least {{min}}', {
            min: minimumSalary,
          }),
        }),
        spouseSalary: amount(t('Spouse requested salary'), t, {
          required: true,
          min: spouseMinimumSalaryValue,
          minMessage: t('Spouse requested salary must be at least {{min}}', {
            min: spouseMinimumSalary,
          }),
        }),
      }),
    [
      t,
      minimumSalaryValue,
      minimumSalary,
      spouseMinimumSalaryValue,
      spouseMinimumSalary,
    ],
  );

  return (
    <StepCard>
      <CardHeader
        title={t('Requested Salary')}
        subheader={<EffectiveDateNote />}
      />
      <CardContent>
        <Typography variant="body1" data-testid="RequestedSalaryCard-message">
          <Trans t={t}>
            Below, enter the annual salary amount you would like to request.
            This salary level includes taxes (local, state, and federal) and
            Minister&apos;s Housing Allowance. It does not include either Social
            Security (SECA) or 403b. They will be added in later.{' '}
          </Trans>
          {hcmSpouse ? (
            <Trans t={t}>
              Because of IRS and Cru requirements, the lowest salary you can
              request is {{ minimumSalary }} ({{ formula }}) for{' '}
              {{ name: hcmUser?.staffInfo.preferredName }} and{' '}
              {{ spouseMinimumSalary }} ({{ spouseFormula }}) for{' '}
              {{ spouseName: hcmSpouse?.staffInfo.preferredName }}.
            </Trans>
          ) : (
            <Trans t={t}>
              Because of IRS and Cru requirements, the lowest salary you can
              request is {{ minimumSalary }} ({{ formula }}).
            </Trans>
          )}{' '}
          <Trans t={t}>
            As you set your salary level, the amount you receive should reflect
            the amount of time you work in ministry.
          </Trans>
        </Typography>

        <Table>
          <StepTableHead />
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">
                {t('Current Requested Salary')}
              </TableCell>
              <TableCell>
                {renderCurrentSalary(salary, estimatedSalary)}
              </TableCell>
              {hcmSpouse && (
                <TableCell>
                  {renderCurrentSalary(spouseSalary, estimatedSpouseSalary)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell component="th" scope="row">
                {t('Minimum Salary')}
              </TableCell>
              <TableCell>{formatCurrency(minimumSalaryValue)}</TableCell>
              {hcmSpouse && (
                <TableCell>
                  {formatCurrency(spouseMinimumSalaryValue)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell component="th" scope="row">
                {t('Maximum Allowable Salary (CAP)')}
              </TableCell>
              <TableCell>
                {formatCurrency(salaryCalculation?.calculations.effectiveCap)}
              </TableCell>
              {hcmSpouse && (
                <TableCell>
                  {formatCurrency(
                    salaryCalculation?.spouseCalculations?.effectiveCap,
                  )}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell component="th" scope="row">
                {t('Requested Salary')}
              </TableCell>
              <TableCell>
                <AutosaveTextField
                  fieldName="salary"
                  schema={schema}
                  label={t('Requested salary')}
                  required
                  error={blockOnCap}
                  saveOnChange={isUserSosa}
                />
              </TableCell>
              {hcmSpouse && (
                <TableCell>
                  <AutosaveTextField
                    fieldName="spouseSalary"
                    schema={schema}
                    label={t('Spouse requested salary')}
                    required
                  />
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>

        {blockOnCap && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Trans t={t}>
              Your request requires additional approvals and cannot be submitted
              online. SOSA staff can have requests exceeding the{' '}
              {{ cap: overCapPerson?.effectiveCap }} cap approved for certain
              geographic locations with the appropriate levels of approval.
              <br />
              <br />
              Please contact{' '}
              <Link href="mailto:payroll@cru.org">payroll@cru.org</Link> for
              further assistance.
            </Trans>
          </Alert>
        )}
      </CardContent>
    </StepCard>
  );
};
