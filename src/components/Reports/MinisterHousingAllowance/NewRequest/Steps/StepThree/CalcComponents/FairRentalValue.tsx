import { useState } from 'react';
import { Box, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { StyledOrderedList } from 'src/components/Reports/MinisterHousingAllowance/styledComponents/StyledOrderedList';
import { useAnnualTotal } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CalculationFormValues } from '../Calculation';
import { CalculationCardSkeleton } from './CalculationCardSkeleton';
import { display, parseInput } from './Helper/formatHelper';

export const FairRentalValue: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const [focused, setFocused] = useState<string | null>(null);
  const isEditing = (name: keyof CalculationFormValues & string) =>
    focused === name;

  const { values, touched, errors, setFieldValue, handleBlur } =
    useFormikContext<CalculationFormValues>();

  const { totalFairRental, annualFairRental } = useAnnualTotal(values);

  return (
    <CalculationCardSkeleton title={t('Fair Rental Value')}>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={1}>
            <Typography>
              <li>{t('Monthly market rental value of your home.')}</li>
            </Typography>
            <Box sx={{ color: 'text.secondary' }}>
              <Trans i18nKey="fairRentalValueQuestion1">
                The best way to determine this amount is to have an appraiser or
                rental real estate specialist provide you with a written
                estimate of the monthly rental value. If this is not possible,
                you may estimate it by calculating 1% of the value of your home
                and lot.
              </Trans>
            </Box>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.rentalValue && errors.rentalValue ? '2px solid red' : '',
          }}
        >
          <TextField
            variant="standard"
            name="rentalValue"
            value={display(
              isEditing,
              'rentalValue',
              values.rentalValue,
              currency,
              locale,
            )}
            onFocus={() => setFocused('rentalValue')}
            onChange={(e) =>
              setFieldValue('rentalValue', parseInput(e.target.value))
            }
            onBlur={(e) => {
              if (focused === 'rentalValue') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={Boolean(touched.rentalValue && errors.rentalValue)}
            helperText={touched.rentalValue && errors.rentalValue}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={2}>
            <Typography>
              <li>
                {t(
                  'Monthly value for furniture, appliances, decorations, and cleaning.',
                )}
              </li>
            </Typography>
            <Box sx={{ color: 'text.secondary' }}>
              <Trans i18nKey="fairRentalValueQuestion2">
                This is a reasonable amount by which the monthly rental of your
                home would increase if it were furnished.
              </Trans>
            </Box>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.furnitureCostsOne && errors.furnitureCostsOne
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="furnitureCostsOne"
            value={display(
              isEditing,
              'furnitureCostsOne',
              values.furnitureCostsOne,
              currency,
              locale,
            )}
            onFocus={() => setFocused('furnitureCostsOne')}
            onChange={(e) => {
              setFieldValue('furnitureCostsOne', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'furnitureCostsOne') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={
              touched.furnitureCostsOne && Boolean(errors.furnitureCostsOne)
            }
            helperText={touched.furnitureCostsOne && errors.furnitureCostsOne}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={3}>
            <Typography>
              <li>{t('Average monthly utility costs.')}</li>
            </Typography>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.avgUtilityOne && errors.avgUtilityOne
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="avgUtilityOne"
            value={display(
              isEditing,
              'avgUtilityOne',
              values.avgUtilityOne,
              currency,
              locale,
            )}
            onFocus={() => setFocused('avgUtilityOne')}
            onChange={(e) => {
              setFieldValue('avgUtilityOne', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'avgUtilityOne') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={touched.avgUtilityOne && Boolean(errors.avgUtilityOne)}
            helperText={touched.avgUtilityOne && errors.avgUtilityOne}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={4}>
            <Typography>
              <li>{t('Total Monthly Fair Rental Value of your Home')}</li>
            </Typography>
            <Box sx={{ color: 'text.secondary' }}>
              <Typography variant="body2">{t('Sum of lines 1-3')}</Typography>
            </Box>
          </StyledOrderedList>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          {currencyFormat(totalFairRental, currency, locale, {
            showTrailingZeros: true,
          })}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography>
            <b>{t('Annual Fair Rental Value of your Home')}</b>
          </Typography>
          <Box sx={{ color: 'text.secondary' }}>
            {t('Line 4 multiplied by 12 months')}
          </Box>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          <b>
            {currencyFormat(annualFairRental, currency, locale, {
              showTrailingZeros: true,
            })}
          </b>
        </TableCell>
      </TableRow>
    </CalculationCardSkeleton>
  );
};
