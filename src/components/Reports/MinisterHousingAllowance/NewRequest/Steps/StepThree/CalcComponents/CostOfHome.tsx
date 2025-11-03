import { useMemo, useState } from 'react';
import { Box, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { StyledOrderedList } from 'src/components/Reports/MinisterHousingAllowance/styledComponents/StyledOrderedList';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CalculationFormValues } from '../Calculation';
import { CalculationCardSkeleton } from './CalculationCardSkeleton';
import { display, parseInput } from './Helper/formatHelper';

interface CostOfHomeProps {
  rentOrOwn?: RentOwnEnum;
}

export const CostOfHome: React.FC<CostOfHomeProps> = ({ rentOrOwn }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const [focused, setFocused] = useState<string | null>(null);
  const isEditing = (name: keyof CalculationFormValues & string) =>
    focused === name;

  const { values, setFieldValue, handleBlur, touched, errors } =
    useFormikContext<CalculationFormValues>();

  const totalMonthly = useMemo(
    () =>
      (values.mortgagePayment ?? 0) +
      (values.furnitureCostsTwo ?? 0) +
      (values.repairCosts ?? 0) +
      (values.avgUtilityTwo ?? 0) +
      (values.unexpectedExpenses ?? 0),
    [
      values.mortgagePayment,
      values.furnitureCostsTwo,
      values.repairCosts,
      values.avgUtilityTwo,
      values.unexpectedExpenses,
    ],
  );

  const totalAnnual = useMemo(() => totalMonthly * 12, [totalMonthly]);

  return (
    <CalculationCardSkeleton title={t('Cost of Providing a Home')}>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={1}>
            <Typography>
              <li>
                {rentOrOwn === RentOwnEnum.Own
                  ? t(
                      'Monthly mortgage payment, taxes, insurance, and any extra principal you pay.',
                    )
                  : t('Monthly rent.')}
              </li>
            </Typography>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.mortgagePayment && errors.mortgagePayment
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="mortgagePayment"
            value={display(
              isEditing,
              'mortgagePayment',
              values.mortgagePayment,
              currency,
              locale,
            )}
            onFocus={() => setFocused('mortgagePayment')}
            onChange={(e) =>
              setFieldValue('mortgagePayment', parseInput(e.target.value))
            }
            onBlur={(e) => {
              if (focused === 'mortgagePayment') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={touched.mortgagePayment && Boolean(errors.mortgagePayment)}
            helperText={touched.mortgagePayment && errors.mortgagePayment}
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
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.furnitureCostsTwo && errors.furnitureCostsTwo
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="furnitureCostsTwo"
            value={display(
              isEditing,
              'furnitureCostsTwo',
              values.furnitureCostsTwo,
              currency,
              locale,
            )}
            onFocus={() => setFocused('furnitureCostsTwo')}
            onChange={(e) => {
              setFieldValue('furnitureCostsTwo', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'furnitureCostsTwo') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={
              touched.furnitureCostsTwo && Boolean(errors.furnitureCostsTwo)
            }
            helperText={touched.furnitureCostsTwo && errors.furnitureCostsTwo}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={3}>
            <Typography>
              <li>
                {t(
                  'Estimated monthly cost of repairs and upkeep, include lawn maintenance, pest control, paint, etc.',
                )}
              </li>
            </Typography>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.repairCosts && errors.repairCosts ? '2px solid red' : '',
          }}
        >
          <TextField
            variant="standard"
            name="repairCosts"
            value={display(
              isEditing,
              'repairCosts',
              values.repairCosts,
              currency,
              locale,
            )}
            onFocus={() => setFocused('repairCosts')}
            onChange={(e) => {
              setFieldValue('repairCosts', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'repairCosts') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={touched.repairCosts && Boolean(errors.repairCosts)}
            helperText={touched.repairCosts && errors.repairCosts}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={4}>
            <Typography>
              <li>{t('Average monthly utility costs.')}</li>
            </Typography>
            {rentOrOwn === RentOwnEnum.Own && (
              <Box sx={{ color: 'text.secondary' }}>
                {t('Entered in the previous section.')}
              </Box>
            )}
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.avgUtilityTwo && errors.avgUtilityTwo
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="avgUtilityTwo"
            value={display(
              isEditing,
              'avgUtilityTwo',
              values.avgUtilityTwo,
              currency,
              locale,
            )}
            onFocus={() => setFocused('avgUtilityTwo')}
            onChange={(e) => {
              setFieldValue('avgUtilityTwo', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'avgUtilityTwo') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={touched.avgUtilityTwo && Boolean(errors.avgUtilityTwo)}
            helperText={touched.avgUtilityTwo && errors.avgUtilityTwo}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={5}>
            <Typography>
              <li>{t('Average monthly amount for unexpected expenses.')}</li>
            </Typography>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.unexpectedExpenses && errors.unexpectedExpenses
                ? '2px solid red'
                : '',
          }}
        >
          <TextField
            variant="standard"
            name="unexpectedExpenses"
            value={display(
              isEditing,
              'unexpectedExpenses',
              values.unexpectedExpenses,
              currency,
              locale,
            )}
            onFocus={() => setFocused('unexpectedExpenses')}
            onChange={(e) => {
              setFieldValue('unexpectedExpenses', parseInput(e.target.value));
            }}
            onBlur={(e) => {
              if (focused === 'unexpectedExpenses') {
                setFocused(null);
              }
              handleBlur(e);
            }}
            inputProps={{ inputMode: 'decimal' }}
            InputProps={{ disableUnderline: true }}
            error={
              touched.unexpectedExpenses && Boolean(errors.unexpectedExpenses)
            }
            helperText={touched.unexpectedExpenses && errors.unexpectedExpenses}
            placeholder={t('Enter Amount')}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={6}>
            <Typography>
              <li>{t('Total Monthly Cost of Providing a Home')}</li>
            </Typography>
            <Box sx={{ color: 'text.secondary' }}>
              <Typography variant="body2">{t('Sum of lines 1-5')}</Typography>
            </Box>
          </StyledOrderedList>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          {currencyFormat(totalMonthly, currency, locale, {
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
            <Trans i18nKey="fairRentalValueQuestion1">
              {t('Line 6 multiplied by 12 months')}
            </Trans>
          </Box>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16 }}>
          <b>
            {currencyFormat(totalAnnual, currency, locale, {
              showTrailingZeros: true,
            })}
          </b>
        </TableCell>
      </TableRow>
    </CalculationCardSkeleton>
  );
};
