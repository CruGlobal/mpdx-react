import React, { useMemo } from 'react';
import {
  Alert,
  CardContent,
  CardHeader,
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
import { AutosaveCheckbox } from '../../Autosave/AutosaveCheckbox';
import { AutosaveTextField } from '../../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../../SalaryCalculatorContext/SalaryCalculatorContext';
import {
  FormattedTableCell,
  StepCard,
  StepTableHead,
} from '../../Shared/StepCard';

export const MaxAllowableStep: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    calculation: salaryCalculation,
    hcmUser,
    hcmSpouse,
  } = useSalaryCalculator();
  const { calculations, spouseCalculations, manuallySplitCap } =
    salaryCalculation ?? {};

  const formatCap = (cap: number | null | undefined) => {
    if (typeof cap !== 'number') {
      return '-';
    }

    return currencyFormat(cap, 'USD', locale, {
      fractionDigits: 0,
    });
  };

  const formattedHardCap = formatCap(calculations?.hardCap);
  const formattedCombinedCap = formatCap(calculations?.combinedCap);

  const calculatedCap = calculations?.calculatedCap ?? 0;
  const spouseCalculatedCap = spouseCalculations?.calculatedCap ?? 0;
  const combinedCap = calculations?.combinedCap ?? 0;
  const formattedCap = currencyFormat(combinedCap, 'USD', locale, {
    showTrailingZeros: true,
  });
  const inputCombinedCap =
    (salaryCalculation?.salaryCap ?? 0) +
    (salaryCalculation?.spouseSalaryCap ?? 0);

  const schema = useMemo(() => {
    const maxMessage = t(
      'Maximum Allowable Salary must not exceed cap of {{cap}}',
      { cap: formattedHardCap },
    );

    return yup.object({
      salaryCap: amount(t('Maximum Allowable Salary'), t, {
        max: calculations?.hardCap,
        maxMessage,
      }),
      spouseSalaryCap: amount(t('Spouse Maximum Allowable Salary'), t, {
        max: calculations?.hardCap,
        maxMessage,
      }),
    });
  }, [t, calculations, formattedHardCap]);

  const name = hcmUser?.staffInfo.preferredName;
  const spouseName = hcmSpouse?.staffInfo.preferredName;

  return (
    <StepCard>
      <CardHeader title={t('Maximum Allowable Salary (CAP)')} />
      <CardContent>
        <Typography variant="body1">
          <Trans t={t}>
            Your Maximum Allowable Salary (CAP) is the maximum amount you can
            request without requiring additional approval. It includes SECA,
            403(b), and any taxes (if applicable) and is calculated using your
            personal information above.
          </Trans>
        </Typography>

        <Typography variant="body1">
          {calculations?.exceptionCap ? (
            <Trans t={t}>
              You have a previously approved Maximum Allowable Salary (CAP). Any
              adjustment that may exceed this cap must be submitted for further
              approval.
            </Trans>
          ) : (
            <Trans t={t}>
              Maximum Allowable Salary may not exceed{' '}
              {{ hardCap: formattedHardCap }} for an individual and{' '}
              {{ combinedCap: formattedCombinedCap }} combined for a couple or a
              widow(er).
            </Trans>
          )}
        </Typography>

        {salaryCalculation?.splitCapRequired ? (
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
                      '{{ combinedCap }} (with neither exceeding {{ singleCap }})',
                      {
                        combinedCap: formattedCombinedCap,
                        singleCap: formattedHardCap,
                      },
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <FormControlLabel
              control={<AutosaveCheckbox fieldName="manuallySplitCap" />}
              label={t(
                'Check if you prefer to split your Combined Maximum Allowable Salary between you and {{ spouseName }} here before requesting your new salary.',
                { spouseName },
              )}
            />

            {manuallySplitCap && (
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

                {inputCombinedCap > combinedCap && (
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
                {hcmSpouse && (
                  <FormattedTableCell value={spouseCalculatedCap} />
                )}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </StepCard>
  );
};
