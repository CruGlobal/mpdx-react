import {
  Box,
  Card,
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
import { Trans, useTranslation } from 'react-i18next';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
} from 'src/components/Reports/styledComponents';
import { useAnnualTotal } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { useMinisterHousingAllowance } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { CalculationFormValues } from '../Calculation';

interface RequestSummaryCardProps {
  rentOrOwn: RentOwnEnum | undefined;
}

export const RequestSummaryCard: React.FC<RequestSummaryCardProps> = ({
  rentOrOwn = RentOwnEnum.Own,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values } = useFormikContext<CalculationFormValues>();
  const { annualTotal } = useAnnualTotal(values);

  const { pageType } = useMinisterHousingAllowance();

  const above = pageType === PageEnum.View ? '' : ' above';

  return (
    <Card
      sx={{
        '@media print': {
          maxWidth: '100%',
          boxSizing: 'border-box',
          boxShadow: 'none',
        },
      }}
    >
      <SimpleScreenOnly>
        <CardHeader title={<b>{t('Your MHA Request Summary')}</b>} />
      </SimpleScreenOnly>
      <SimplePrintOnly>
        <Typography variant="h6" sx={{ mb: -3 }}>
          {t('Request Summary')}
        </Typography>
      </SimplePrintOnly>
      <CardContent>
        <Table
          sx={{
            '& .MuiTableRow-root:last-child td': {
              border: 0,
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 400 } }}>
              <TableCell sx={{ width: '70%', fontSize: 16 }}>
                {t('Rent or Own')}
              </TableCell>
              <TableCell sx={{ width: '30%', fontSize: 16 }}>
                {rentOrOwn === RentOwnEnum.Own ? t('Own') : t('Rent')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ width: '70%' }}>
                <Typography>
                  <b>{t('Your Annual MHA Total')}</b>
                </Typography>
                <Box sx={{ color: 'text.secondary' }}>
                  <Trans i18nKey="requestSummaryCardInfo" values={{ above }}>
                    This is calculated from your {above} responses and is the
                    lower of the Annual Fair Rental Value or the Annual Cost of
                    Providing a Home.
                  </Trans>
                </Box>
              </TableCell>
              <TableCell
                sx={{ width: '30%', fontSize: 16, fontWeight: 'bold' }}
              >
                {currencyFormat(annualTotal, currency, locale, {
                  showTrailingZeros: true,
                })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
