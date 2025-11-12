import { Box, TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { StyledOrderedList } from 'src/components/Reports/MinisterHousingAllowance/styledComponents/StyledOrderedList';
import { useAnnualTotal } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CalculationFormValues } from '../Calculation';
import { CalculationCardSkeleton } from './CalculationCardSkeleton';
import { CustomTextField } from './Helper/CustomTextField';

interface CostOfHomeProps {
  rentOrOwn?: RentOwnEnum;
}

export const CostOfHome: React.FC<CostOfHomeProps> = ({ rentOrOwn }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values, touched, errors } = useFormikContext<CalculationFormValues>();

  const { totalCostOfHome, annualCostOfHome } = useAnnualTotal(values);

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
          <CustomTextField
            name="mortgagePayment"
            value={values.mortgagePayment}
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
          <CustomTextField
            name="furnitureCostsTwo"
            value={values.furnitureCostsTwo}
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
          <CustomTextField name="repairCosts" value={values.repairCosts} />
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
          <CustomTextField name="avgUtilityTwo" value={values.avgUtilityTwo} />
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
          <CustomTextField
            name="unexpectedExpenses"
            value={values.unexpectedExpenses}
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
          {currencyFormat(totalCostOfHome, currency, locale, {
            showTrailingZeros: true,
          })}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {rentOrOwn === RentOwnEnum.Rent
              ? t('Annual Fair Rental Value of your Home')
              : t('Annual Cost of Providing a Home')}
          </Typography>
          <Box sx={{ color: 'text.secondary' }}>
            {t('Line 6 multiplied by 12 months')}
          </Box>
        </TableCell>
        <TableCell sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}>
          {currencyFormat(annualCostOfHome, currency, locale, {
            showTrailingZeros: true,
          })}
        </TableCell>
      </TableRow>
    </CalculationCardSkeleton>
  );
};
