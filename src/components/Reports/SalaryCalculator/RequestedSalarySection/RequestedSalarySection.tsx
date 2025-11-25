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
  const { hcm } = useSalaryCalculator();
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

  // TODO: Use real minimum salary values when they are available in the API
  const minimumSalary = 55081.96;
  const spouseMinimumSalary = 45081.96;

  const formula = t('MHA + $8,400 - SECA');
  const formatSalary = (salary: number) =>
    currencyFormat(salary, 'USD', locale);

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
              request is {{ minimumSalary: formatSalary(minimumSalary) }}{' '}
              {formula} for {{ name: self.staffInfo.firstName }} and{' '}
              {{ spouseMinimumSalary: formatSalary(spouseMinimumSalary) }}{' '}
              {formula} for {{ spouseName: spouse.staffInfo.firstName }}.
            </Trans>
          ) : (
            <Trans t={t}>
              Because of IRS and Cru requirements, the lowest salary you can
              request is {{ minimumSalary: formatSalary(minimumSalary) }}{' '}
              {formula}.
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
              <FormattedTableCell value={minimumSalary} />
              {spouse && <FormattedTableCell value={spouseMinimumSalary} />}
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
