import React, { useCallback } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormCard } from 'src/components/Reports/Shared/CalculationReports/FormCard/FormCard';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSaveField } from '../../Shared/AutoSave/useSaveField';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';

export const Deduction: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { pageType, traditional403bPercentage, roth403bPercentage } =
    useAdditionalSalaryRequest();
  const { values: formValues, setFieldValue } =
    useFormikContext<CompleteFormValues>();

  const saveField = useSaveField({ formValues });

  const {
    calculatedTraditionalDeduction,
    calculatedRothDeduction,
    contribution403b,
    totalDeduction,
  } = useSalaryCalculations({ values: formValues });

  const handleTraditionalCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setFieldValue('deductTaxDeferredPercent', checked);
      saveField({ deductTaxDeferredPercent: checked });
    },
    [setFieldValue, saveField],
  );

  const handleRothCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setFieldValue('deductRothPercent', checked);
      saveField({ deductRothPercent: checked });
    },
    [setFieldValue, saveField],
  );

  return (
    <FormCard title={t('403(b) Deduction')} hideHeaders>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <FormControlLabel
            sx={{ alignItems: 'flex-start', ml: 0 }}
            control={
              <Checkbox
                checked={formValues.deductTaxDeferredPercent || false}
                onChange={handleTraditionalCheckboxChange}
                disabled={pageType === PageEnum.View}
                sx={{ mt: -0.5 }}
                inputProps={{
                  'aria-label': t(
                    'Use default Percentage for 403(b) Traditional deduction',
                  ),
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  {t(
                    'Check this box if you would like {{percentage}}% of your Additional Salary Request contributed to your Traditional 403(b).',
                    {
                      percentage: (traditional403bPercentage * 100).toFixed(0),
                    },
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {t(
                    'This is your regular 403(b) percentage contribution as selected on your latest Salary Calculation Form.',
                  )}
                </Typography>
              </Box>
            }
          />
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16 }}
          aria-label="Calculated traditional deduction amount"
        >
          {currencyFormat(calculatedTraditionalDeduction, 'USD', locale)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <FormControlLabel
            sx={{ alignItems: 'flex-start', ml: 0 }}
            control={
              <Checkbox
                checked={formValues.deductRothPercent || false}
                onChange={handleRothCheckboxChange}
                disabled={pageType === PageEnum.View}
                sx={{ mt: -0.5 }}
                inputProps={{
                  'aria-label': t(
                    'Use default Percentage for 403(b) Roth deduction',
                  ),
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  {t(
                    'Check this box if you would like {{percentage}}% of your Additional Salary Request contributed to your Roth 403(b).',
                    {
                      percentage: (roth403bPercentage * 100).toFixed(0),
                    },
                  )}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {t(
                    'This is your regular 403(b) percentage contribution as selected on your latest Salary Calculation Form.',
                  )}
                </Typography>
              </Box>
            }
          />
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16 }}
          aria-label="Calculated roth deduction amount"
        >
          {currencyFormat(calculatedRothDeduction, 'USD', locale)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1">
            {t('403(b) Contribution Requested as Additional Salary')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('This is the amount you requested above.')}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          {currencyFormat(contribution403b, 'USD', locale)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography variant="body1" fontWeight="bold">
            {t('Total 403(b) Deduction')}
          </Typography>
        </TableCell>
        <TableCell
          sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}
          aria-label="Total requested amount"
        >
          {currencyFormat(totalDeduction, 'USD', locale)}
        </TableCell>
      </TableRow>
    </FormCard>
  );
};
