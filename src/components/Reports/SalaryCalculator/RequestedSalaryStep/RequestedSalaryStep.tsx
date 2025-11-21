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
import { Stack } from '@mui/system';
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

export const RequestedSalaryStep: React.FC = () => {
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
  const hasSpouse = hcm?.length === 2;

  // TODO: Use real minimum salary values when they are available in the API
  const minimumSalary = 55081.96;
  const spouseMinimumSalary = 45081.96;

  const formula = t('MHA + $8,400 - SECA');
  const formatSalary = (salary: number) =>
    currencyFormat(salary, 'USD', locale);

  return (
    <Stack gap={4} padding={4}>
      <Typography variant="h4">{t('Requested Salary')}</Typography>
      <Typography variant="body1">
        <Trans t={t}>
          Below, enter the annual salary amount you would like to request. This
          salary level includes taxes (local, state, and federal) and
          Minister&apos;s Housing Allowance. It does not include either Social
          Security (SECA) or 403b. They will be added in later.{' '}
        </Trans>
        {hasSpouse ? (
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
      <StepCard>
        <CardHeader title={t('Requested Salary')} />
        <CardContent>
          <Table>
            <StepTableHead />
            <TableBody>
              <TableRow>
                <FormattedTableCell
                  component="th"
                  scope="row"
                  value={t('Current Salary')}
                />
                <FormattedTableCell
                  value={self?.currentSalary.grossSalaryAmount}
                />
                {hasSpouse && (
                  <FormattedTableCell
                    value={spouse?.currentSalary.grossSalaryAmount}
                  />
                )}
              </TableRow>

              <TableRow>
                <FormattedTableCell
                  component="th"
                  scope="row"
                  value={t('Salary Minimum')}
                />
                <FormattedTableCell value={minimumSalary} />
                {hasSpouse && (
                  <FormattedTableCell value={spouseMinimumSalary} />
                )}
              </TableRow>

              <TableRow>
                <FormattedTableCell
                  component="th"
                  scope="row"
                  value={t('Requested Salary')}
                />
                <TableCell>
                  <AutosaveTextField
                    fieldName="salary"
                    schema={schema}
                    label={t('Requested salary')}
                    required
                  />
                </TableCell>
                {hasSpouse && (
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
    </Stack>
  );
};
