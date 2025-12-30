import React, { useMemo, useState } from 'react';
import {
  Alert,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
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

export const MaxAllowableStep: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation: salaryCalculation, hcm } = useSalaryCalculator();
  const { calculations, spouseCalculations } = salaryCalculation ?? {};
  const [splitting, setSplitting] = useState(false);

  const schema = useMemo(
    () =>
      yup.object({
        salaryCap: amount(t('Maximum Allowable Salary'), t),
        spouseSalaryCap: amount(t('Spouse Maximum Allowable Salary'), t),
      }),
    [t],
  );

  const formatCap = (cap: number | null | undefined) => {
    if (typeof cap !== 'number') {
      return '-';
    }

    return currencyFormat(cap, 'USD', locale, {
      fractionDigits: 0,
    });
  };

  const formattedSingleCap = formatCap(calculations?.individualCap);
  const formattedFamilyCap = formatCap(calculations?.familyCap);

  const [self, spouse] = hcm ?? [];
  const calculatedCap = calculations?.calculatedCap ?? 0;
  const spouseCalculatedCap = spouseCalculations?.calculatedCap ?? 0;
  const combinedCalculatedCap = calculatedCap + spouseCalculatedCap;
  const exceptionCap = self?.exceptionSalaryCap.amount ?? 0;
  const cap = Math.max(
    exceptionCap,
    (spouse ? calculations?.familyCap : calculations?.hardCap) ?? 0,
  );
  // If the user and their spouse's combined calculated cap exceeds their allowed cap as a
  // family (taking into account an exception they might have), then they will need to split their
  // family cap between the two of them
  const overCap = spouse && combinedCalculatedCap > cap;
  const formattedCap = currencyFormat(cap, 'USD', locale, {
    showTrailingZeros: true,
  });
  const inputCombinedMaxSalary =
    (salaryCalculation?.salaryCap ?? 0) +
    (salaryCalculation?.spouseSalaryCap ?? 0);

  const name = self?.staffInfo.firstName;
  const spouseName = spouse?.staffInfo.firstName;

  return (
    <StepCard>
      <CardHeader title={t('Maximum Allowable Salary (CAP)')} />
      <CardContent>
        <Typography variant="body1">
          <Trans t={t}>
            Your Maximum Allowable Salary (CAP) includes SECA, 403(b), MHA, and
            any taxes (if applicable). It is calculated using your personal
            information above.
          </Trans>
        </Typography>

        <Typography variant="body1">
          <Trans t={t}>
            Maximum Allowable Salary may not exceed{' '}
            {{ singleCap: formattedSingleCap }} for an individual and{' '}
            {{ familyCap: formattedFamilyCap }} combined for a couple or a
            widow(er).
          </Trans>
        </Typography>

        {overCap ? (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Category')}</TableCell>
                  <TableCell>
                    {t('{{ name }} & {{ spouseName }} Combined', {
                      name,
                      spouseName,
                    })}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{t('Maximum Allowable Salary')}</TableCell>
                  <TableCell>
                    {t(
                      '{{ familyCap }} (with neither exceeding {{ singleCap }})',
                      {
                        familyCap: formattedFamilyCap,
                        singleCap: formattedSingleCap,
                      },
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <FormControlLabel
              control={
                <Checkbox
                  value={splitting}
                  onChange={(event) => setSplitting(event.target.checked)}
                />
              }
              label={t(
                'Check if you prefer to split your Combined Maximum Allowable Salary between you and {{ spouseName }} here before requesting your new salary.',
                { spouseName },
              )}
            />

            {splitting && (
              <>
                <Divider />
                <Typography variant="body1">
                  <Trans t={t}>
                    Please select how you would like to distribute your combined
                    Maximum Allowable Salary between you and{' '}
                    {{ spouse: spouseName }}:
                  </Trans>
                </Typography>

                <Stack
                  component={Typography}
                  direction="row"
                  justifyContent="space-between"
                  sx={{ fontWeight: 'bold' }}
                >
                  <span>{t('Combined Maximum Allowable Salary')}:</span>
                  <span>{formattedCap}</span>
                </Stack>

                <Stack direction="row" gap={4}>
                  <AutosaveTextField
                    fieldName="salaryCap"
                    schema={schema}
                    label={t('{{ name }} Maximum Allowable Salary', { name })}
                    required
                  />
                  <AutosaveTextField
                    fieldName="spouseSalaryCap"
                    schema={schema}
                    label={t('{{ spouseName }} Maximum Allowable Salary', {
                      spouseName,
                    })}
                    required
                  />
                </Stack>

                {inputCombinedMaxSalary > cap && (
                  <Alert severity="error">
                    <Trans t={t}>
                      Your combined maximum allowable salary exceeds your
                      maximum allowable salary of {{ maxSalary: formattedCap }}.
                    </Trans>
                  </Alert>
                )}
              </>
            )}
          </>
        ) : (
          <Table>
            <StepTableHead />
            <TableBody>
              <TableRow>
                <FormattedTableCell value={t('Maximum Allowable Salary')} />
                <FormattedTableCell value={calculatedCap} />
                {spouse && <FormattedTableCell value={spouseCalculatedCap} />}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </StepCard>
  );
};
