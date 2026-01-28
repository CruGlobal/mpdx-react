import React from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { StepCard } from '../../SharedComponents/StepCard';

export const NetAdditionalSalary: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();

  const traditional403bContribution =
    requestData?.additionalSalaryRequest?.traditional403bContribution ?? 0;

  const { netSalary } = useSalaryCalculations({
    traditional403bContribution,
    values,
  });

  return (
    <StepCard>
      <CardHeader title={t('Net Additional Salary')} />
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <Typography variant="body1" fontWeight="bold">
                  {t('Net Additional Salary (Before Taxes)')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(
                    'Total Additional Salary Requested minus 403(b) Contribution',
                  )}
                </Typography>
              </TableCell>
              <TableCell sx={{ width: '30%', fontSize: 16 }}>
                {currencyFormat(netSalary, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
              <TableCell colSpan={2}>
                <Trans t={t}>
                  <Typography variant="body2">
                    <b>Note:</b> Taxes and any requested 403(b) amount will be
                    subtracted from the amount of additional salary that you are
                    requesting. The percentage of taxes on this request should be
                    similar to that of your paychecks, but may be more if you have
                    chosen to have an additional amount of withholding on your
                    paychecks. If you have any questions about this, please call 1
                    (888) 278-7233 (option 2, 2)
                  </Typography>
                </Trans>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};
