import React from 'react';
import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { AutosaveCustomTextField } from '../../Shared/AutoSave/AutosaveCustomTextField';
import { useCompleteFormCategories } from '../../Shared/useCompleteFormCategories';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { StepCard } from '../../SharedComponents/StepCard';

export const AdditionalSalaryRequest: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { requestData, pageType } = useAdditionalSalaryRequest();
  const categories = useCompleteFormCategories();
  const { values, errors, touched } = useFormikContext<CompleteFormValues>();

  const traditional403bContribution =
    requestData?.latestAdditionalSalaryRequest?.traditional403bContribution ??
    0;
  const { total } = useSalaryCalculations({
    traditional403bContribution,
    values,
  });

  return (
    <StepCard
      sx={{
        '.MuiTableCell-head.MuiTableCell-root': {
          width: '25%',
        },
      }}
    >
      <CardHeader title={t('Additional Salary Request')} />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '70%' }}>
                {t('Category')}
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', width: '30%', textAlign: 'center' }}
              >
                {t('Amount')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(({ key, label, description }) => (
              <TableRow key={key}>
                <TableCell sx={{ width: '70%' }}>
                  <Typography>{label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    width: '30%',
                    textAlign: 'center',
                    border:
                      touched[key as keyof CompleteFormValues] &&
                      errors[key as keyof CompleteFormValues]
                        ? '2px solid red'
                        : '',
                  }}
                >
                  {pageType === PageEnum.View ? (
                    currencyFormat(Number(values[key]) || 0, currency, locale)
                  ) : (
                    <AutosaveCustomTextField
                      fullWidth
                      size="small"
                      variant="standard"
                      fieldName={key as keyof CompleteFormValues}
                      InputProps={{
                        disableUnderline: true,
                        inputMode: 'decimal',
                      }}
                      placeholder={currencyFormat(0, currency, locale)}
                      sx={{
                        '& .MuiInputBase-input': {
                          padding: 0,
                          textAlign: 'center',
                        },
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ '& td': { borderBottom: 'none' } }}>
              <TableCell sx={{ width: '70%', fontWeight: 'bold' }} scope="row">
                {t('Total Additional Salary Requested')}
              </TableCell>
              <TableCell
                sx={{
                  width: '30%',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  outline: errors.totalAdditionalSalaryRequested
                    ? '2px solid red'
                    : 'none',
                }}
                data-testid="total-amount"
              >
                {currencyFormat(total, 'USD', locale)}
                {errors.totalAdditionalSalaryRequested && (
                  <Typography variant="body2" color="error">
                    {t('Exceeds account balance.')}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};
