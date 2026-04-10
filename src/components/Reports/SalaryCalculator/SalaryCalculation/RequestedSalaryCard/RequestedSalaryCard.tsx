import React, { useMemo } from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { amount } from 'src/lib/yupHelpers';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { CalculationFieldsFragment } from '../../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import {
  FormattedTableCell,
  StepCard,
  StepTableHead,
} from '../../Shared/StepCard';
import { useFormatters } from '../../Shared/useFormatters';

export const RequestedSalaryCard: React.FC = () => {
  const { t } = useTranslation();
  const {
    calculation: salaryCalculation,
    hcmUser,
    hcmSpouse,
  } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

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
      <CardHeader title={t('Requested Salary')} />
      <CardContent>
        <Typography variant="body1">
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
              {{ spouseMinimumSalary }} ({{ formula: spouseFormula }}) for{' '}
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
                {t('Current Salary')}
              </TableCell>
              <FormattedTableCell
                value={hcmUser?.currentSalary.grossSalaryAmount}
              />
              {hcmSpouse && (
                <FormattedTableCell
                  value={hcmSpouse.currentSalary.grossSalaryAmount}
                />
              )}
            </TableRow>

            <TableRow>
              <TableCell component="th" scope="row">
                {t('Salary Minimum')}
              </TableCell>
              <FormattedTableCell value={minimumSalaryValue} />
              {hcmSpouse && (
                <FormattedTableCell value={spouseMinimumSalaryValue} />
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
      </CardContent>
    </StepCard>
  );
};
