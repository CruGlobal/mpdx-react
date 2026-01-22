import { Box, TableCell, TableRow, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { StyledOrderedList } from 'src/components/Reports/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';
import { useAnnualTotal } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { FormCard } from '../../../../Shared/CalculationReports/FormCard/FormCard';
import { AutosaveCustomTextField } from '../../../Shared/AutoSave/AutosaveCustomTextField';
import { CalculationFormValues } from '../Calculation';

interface CostOfHomeProps {
  schema: yup.Schema;
  rentOrOwn?: MhaRentOrOwnEnum;
}

export const CostOfHome: React.FC<CostOfHomeProps> = ({
  rentOrOwn,
  schema,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values, touched, errors } = useFormikContext<CalculationFormValues>();

  const { totalCostOfHome, annualCostOfHome } = useAnnualTotal(values);

  return (
    <FormCard title={t('Cost of Providing a Home')}>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={1}>
            <Typography component="li">
              {rentOrOwn === MhaRentOrOwnEnum.Own
                ? t(
                    'Monthly mortgage payment, taxes, insurance, and any extra principal you pay.',
                  )
                : t('Monthly rent.')}
            </Typography>
          </StyledOrderedList>
        </TableCell>
        <TableCell
          sx={{
            width: '30%',
            color: 'text.secondary',
            border:
              touched.mortgageOrRentPayment && errors.mortgageOrRentPayment
                ? '2px solid red'
                : '',
          }}
        >
          <AutosaveCustomTextField
            fullWidth
            size="small"
            variant="standard"
            placeholder={currencyFormat(0, currency, locale)}
            InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
            fieldName="mortgageOrRentPayment"
            schema={schema}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={2}>
            <Typography component="li">
              {t(
                'Monthly value for furniture, appliances, decorations, and cleaning.',
              )}
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
          <AutosaveCustomTextField
            fullWidth
            size="small"
            variant="standard"
            placeholder={currencyFormat(0, currency, locale)}
            InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
            fieldName="furnitureCostsTwo"
            schema={schema}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={3}>
            <Typography component="li">
              {t(
                'Estimated monthly cost of repairs and upkeep, include lawn maintenance, pest control, paint, etc.',
              )}
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
          <AutosaveCustomTextField
            fullWidth
            size="small"
            variant="standard"
            placeholder={currencyFormat(0, currency, locale)}
            InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
            fieldName="repairCosts"
            schema={schema}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={4}>
            <Typography component="li">
              {t('Average monthly utility costs.')}
            </Typography>
            {rentOrOwn === MhaRentOrOwnEnum.Own && (
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
          <AutosaveCustomTextField
            fullWidth
            size="small"
            variant="standard"
            placeholder={currencyFormat(0, currency, locale)}
            InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
            fieldName="avgUtilityTwo"
            schema={schema}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={5}>
            <Typography component="li">
              {t('Average monthly amount for unexpected expenses.')}
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
          <AutosaveCustomTextField
            fullWidth
            size="small"
            variant="standard"
            placeholder={currencyFormat(0, currency, locale)}
            InputProps={{ disableUnderline: true, inputMode: 'decimal' }}
            fieldName="unexpectedExpenses"
            schema={schema}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ width: '70%' }}>
          <StyledOrderedList component="ol" start={6}>
            <Typography component="li">
              {t('Total Monthly Cost of Providing a Home')}
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
            {rentOrOwn === MhaRentOrOwnEnum.Rent
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
    </FormCard>
  );
};
