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
import { PageEnum } from 'src/components/HrTools/Shared/CalculationReports/Shared/sharedTypes';
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

  const { pageType } = useAdditionalSalaryRequest();
  const categories = useCompleteFormCategories();
  const { values, errors, submitCount } =
    useFormikContext<CompleteFormValues>();

  const { total } = useSalaryCalculations({
    values,
  });
  // A new form starts at $0, so only flag that once the user tries to submit
  const totalError =
    (total > 0 || submitCount > 0) && errors.totalAdditionalSalaryRequested;

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
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
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

                <TableCell sx={{ width: '30%' }}>
                  {pageType === PageEnum.View ? (
                    currencyFormat(Number(values[key]) || 0, currency, locale)
                  ) : (
                    <AutosaveCustomTextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      fieldName={key as keyof CompleteFormValues}
                      slotProps={{ htmlInput: { 'aria-label': label } }}
                      placeholder={currencyFormat(0, currency, locale)}
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
                  outline: totalError ? '2px solid red' : 'none',
                }}
                data-testid="total-amount"
              >
                {currencyFormat(total, currency, locale)}
                {totalError && (
                  <Typography variant="body2" color="error">
                    {totalError}
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
