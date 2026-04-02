import React, { useCallback } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { ElectionType403bEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useSaveField } from '../../Shared/AutoSave/useSaveField';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';

export const DeductionPercentQuestion: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';
  const { traditional403bPercentage, roth403bPercentage } =
    useAdditionalSalaryRequest();

  const {
    values: formValues,
    setFieldValue,
    errors,
  } = useFormikContext<CompleteFormValues>();
  const saveField = useSaveField({ formValues });

  const { calculatedTraditionalDeduction, calculatedRothDeduction } =
    useSalaryCalculations({ values: formValues });

  const handleCustomChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value as ElectionType403bEnum;
      setFieldValue('electionType403b', value);
      saveField({ electionType403b: value });
    },
    [saveField, setFieldValue],
  );

  return (
    <TableRow>
      <TableCell colSpan={2}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {t(
            'How would you like your Additional Salary Request contributed to your 403(b)?',
          )}
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            name="electionType403b"
            value={formValues.electionType403b}
            onChange={handleCustomChange}
          >
            <FormControlLabel
              value={ElectionType403bEnum.None}
              control={<Radio />}
              label={t('No 403(b) contribution - all funds go to my account')}
            />
            <FormControlLabel
              value={ElectionType403bEnum.Pretax}
              control={<Radio />}
              label={t('100% of this request goes to my Traditional 403(b)')}
            />
            <FormControlLabel
              value={ElectionType403bEnum.Roth}
              control={<Radio />}
              label={t('100% of this request goes to my Roth 403(b)')}
            />
            <FormControlLabel
              value={ElectionType403bEnum.Standard}
              control={<Radio />}
              label={t(
                'Apply my regular 403(b) percentages ({{traditional}}% Traditional / {{roth}}% Roth)',
                {
                  traditional: traditional403bPercentage * 100,
                  roth: roth403bPercentage * 100,
                },
              )}
            />
          </RadioGroup>
          {formValues.electionType403b === ElectionType403bEnum.Standard && (
            <Box ml={4}>
              <Typography variant="body2">
                {t('Traditional 403(b) Deduction')}:{' '}
                {currencyFormat(
                  calculatedTraditionalDeduction,
                  currency,
                  locale,
                  {
                    showTrailingZeros: true,
                  },
                )}
              </Typography>
              <Typography variant="body2">
                {t('Roth 403(b) Deduction')}:{' '}
                {currencyFormat(calculatedRothDeduction, currency, locale, {
                  showTrailingZeros: true,
                })}
              </Typography>
            </Box>
          )}
          {errors.electionType403b && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {errors.electionType403b}
            </Typography>
          )}
        </FormControl>
      </TableCell>
    </TableRow>
  );
};
