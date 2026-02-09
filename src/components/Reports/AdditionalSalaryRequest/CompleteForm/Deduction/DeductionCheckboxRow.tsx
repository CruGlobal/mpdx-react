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
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSaveField } from '../../Shared/AutoSave/useSaveField';

interface DeductionCheckboxRowProps {
  fieldName: 'deductTaxDeferredPercent' | 'deductRothPercent';
  percentage: number;
  calculatedDeduction: number;
}

export const DeductionCheckboxRow: React.FC<DeductionCheckboxRowProps> = ({
  fieldName,
  percentage,
  calculatedDeduction,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { pageType } = useAdditionalSalaryRequest();

  const isTraditional = fieldName === 'deductTaxDeferredPercent';

  const { values: formValues, setFieldValue } =
    useFormikContext<CompleteFormValues>();
  const saveField = useSaveField({ formValues });

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setFieldValue(fieldName, checked);
      saveField({ [fieldName]: checked });
    },
    [setFieldValue, saveField],
  );

  return (
    <TableRow>
      <TableCell sx={{ width: '70%' }}>
        <FormControlLabel
          sx={{ alignItems: 'flex-start', ml: 0 }}
          control={
            <Checkbox
              checked={formValues[fieldName] || false}
              onChange={handleCheckboxChange}
              disabled={pageType === PageEnum.View}
              sx={{ mt: -0.5 }}
              inputProps={{
                'aria-label': isTraditional
                  ? t('Use default Percentage for 403(b) Traditional deduction')
                  : t('Use default Percentage for 403(b) Roth deduction'),
              }}
            />
          }
          label={
            <Box>
              <Typography variant="body1">
                {isTraditional
                  ? t(
                      'Check this box if you would like {{percentage}}% of your Additional Salary Request contributed to your Traditional 403(b).',
                      {
                        percentage: (percentage * 100).toFixed(0),
                      },
                    )
                  : t(
                      'Check this box if you would like {{percentage}}% of your Additional Salary Request contributed to your Roth 403(b).',
                      {
                        percentage: (percentage * 100).toFixed(0),
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
        aria-label={
          isTraditional
            ? 'Calculated traditional deduction amount'
            : 'Calculated roth deduction amount'
        }
      >
        {currencyFormat(calculatedDeduction, 'USD', locale)}
      </TableCell>
    </TableRow>
  );
};
