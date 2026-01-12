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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount } from 'src/lib/yupHelpers';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import {
  FormattedTableCell,
  StepCard,
  StepTableHead,
} from '../Shared/StepCard';

export const RequestedSalarySection: React.FC = () => {
  const { t } = useTranslation();
  const { calculation: salaryCalculation, hcm } = useSalaryCalculator();
  const locale = useLocale();

  const schema = useMemo(
    () =>
      yup.object({
        salary: amount(t('Requested salary'), t),
        spouseSalary: amount(t('Spouse requested salary'), t),
      }),
    [t],
  );

  const [self, spouse] = hcm ?? [];
  const minimumSalaryValue =
    salaryCalculation?.calculations.minimumRequestedSalary ?? 0;
  const spouseMinimumSalaryValue =
    salaryCalculation?.spouseCalculations?.minimumRequestedSalary ?? 0;

  const formula = t('MHA + {{ min }} - SECA', {
    min: currencyFormat(
      salaryCalculation?.calculations.minimumRequiredSalary ?? 0,
      'USD',
      locale,
    ),
  });

  const minimumSalary = currencyFormat(minimumSalaryValue, 'USD', locale);
  const spouseMinimumSalary = currencyFormat(
    spouseMinimumSalaryValue,
    'USD',
    locale,
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
          {spouse ? (
            <Trans t={t}>
              Because of IRS and Cru requirements, the lowest salary you can
              request is {{ minimumSalary }} ({formula}) for{' '}
              {{ name: self.staffInfo.preferredName }} and{' '}
              {{ spouseMinimumSalary }} ({formula}) for{' '}
              {{ spouseName: spouse.staffInfo.preferredName }}.
            </Trans>
          ) : (
            <Trans t={t}>
              Because of IRS and Cru requirements, the lowest salary you can
              request is {{ minimumSalary }} ({formula}).
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
                value={self?.currentSalary.grossSalaryAmount}
              />
              {spouse && (
                <FormattedTableCell
                  value={spouse.currentSalary.grossSalaryAmount}
                />
              )}
            </TableRow>

            <TableRow>
              <TableCell component="th" scope="row">
                {t('Salary Minimum')}
              </TableCell>
              <FormattedTableCell value={minimumSalaryValue} />
              {spouse && (
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
              {spouse && (
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
