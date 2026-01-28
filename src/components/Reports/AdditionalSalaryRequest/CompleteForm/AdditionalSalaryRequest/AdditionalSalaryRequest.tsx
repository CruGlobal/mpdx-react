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

  const { requestData, pageType } = useAdditionalSalaryRequest();
  const categories = useCompleteFormCategories();
  const { values } = useFormikContext<CompleteFormValues>();

  const traditional403bContribution =
    requestData?.additionalSalaryRequest?.traditional403bContribution ?? 0;
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
            <TableRow
              sx={(theme) => ({
                color: theme.palette.primary.main,
                fontWeight: 'bold',
              })}
            >
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
                  }}
                >
                  {pageType === PageEnum.View ? (
                    currencyFormat(Number(values[key]) || 0, 'USD', locale)
                  ) : (
                    <AutosaveCustomTextField
                      fullWidth
                      size="small"
                      fieldName={key as keyof CompleteFormValues}
                      placeholder={t('Enter amount')}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                        },
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
                sx={{ width: '30%', fontWeight: 'bold', textAlign: 'center' }}
                data-testid="total-amount"
              >
                {currencyFormat(total, 'USD', locale)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </StepCard>
  );
};
