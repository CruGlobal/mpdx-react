import React, { useMemo } from 'react';
import {
  Alert,
  CardContent,
  CardHeader,
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
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
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

export interface MaxAllowableStepProps {
  maxSalary?: number;
  spouseMaxSalary?: number;
}

export const MaxAllowableStep: React.FC<MaxAllowableStepProps> = ({
  // TODO: Get the maximum values for this salary calculation from the MPDX API once they exist
  maxSalary = 58602,
  spouseMaxSalary = 48602,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation, hcm } = useSalaryCalculator();
  const { goalMiscConstants: miscConstants } = useGoalCalculatorConstants();

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

  const singleCap =
    miscConstants?.BOARD_APPROVED_SALARY_CALC?.SINGLE_OTHER?.fee;
  const marriedCap =
    miscConstants?.BOARD_APPROVED_SALARY_CALC?.MARRIED_OTHER?.fee;

  const [self, spouse] = hcm ?? [];
  const combinedMaxSalary = maxSalary + spouseMaxSalary;
  const cap =
    self?.exceptionSalaryCap.amount ?? (spouse ? marriedCap : singleCap);
  const overCap = typeof cap === 'number' ? combinedMaxSalary > cap : false;
  const inputCombinedMaxSalary =
    (calculation?.salaryCap ?? 0) + (calculation?.spouseSalaryCap ?? 0);

  const formattedCombinedMaxSalary = currencyFormat(
    combinedMaxSalary,
    'USD',
    locale,
    { showTrailingZeros: true },
  );

  return (
    <StepCard>
      <CardHeader title={t('Maximum Allowable Salary (CAP)')} />
      <CardContent>
        <Typography variant="body1">
          <Trans t={t}>
            Your Maximum Allowable Salary (cap) includes SECA, 403(b), MHA, and
            any taxes (if applicable). It is calculated using your personal
            information above.
          </Trans>
        </Typography>

        <Typography variant="body1">
          <Trans t={t}>
            Maximum Allowable Salary may not exceed{' '}
            {{ singleCap: formatCap(singleCap) }} for an individual and{' '}
            {{ marriedCap: formatCap(marriedCap) }} combined for a couple or a
            widow(er).
          </Trans>
        </Typography>

        {overCap && (
          <Typography variant="body1">
            <Trans t={t}>
              Please select how you would like to distribute your combined
              Maximum Allowable Salary between you and{' '}
              {{ spouse: spouse.staffInfo.firstName }}:
            </Trans>
          </Typography>
        )}

        {overCap ? (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ fontWeight: 'bold' }}
            >
              <span>{t('Combined Maximum Allowable Salary')}:</span>
              <span>{formattedCombinedMaxSalary}</span>
            </Stack>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{self.staffInfo.firstName}</TableCell>
                  <TableCell>{spouse.staffInfo.firstName}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <AutosaveTextField
                      fieldName="salaryCap"
                      schema={schema}
                      label={t('Maximum Allowable Salary')}
                      required
                    />
                  </TableCell>
                  <TableCell>
                    <AutosaveTextField
                      fieldName="spouseSalaryCap"
                      schema={schema}
                      label={t('Spouse Maximum Allowable Salary')}
                      required
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {inputCombinedMaxSalary > combinedMaxSalary && (
              <Alert severity="error">
                <Trans t={t}>
                  Your combined maximum allowable salary exceeds your maximum
                  allowable salary of{' '}
                  {{ maxSalary: formattedCombinedMaxSalary }}.
                </Trans>
              </Alert>
            )}
          </>
        ) : (
          <Table>
            <StepTableHead />
            <TableBody>
              <TableRow>
                <FormattedTableCell value={t('Maximum Allowable Salary')} />
                <FormattedTableCell value={maxSalary} />
                {spouse && <FormattedTableCell value={spouseMaxSalary} />}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </StepCard>
  );
};
