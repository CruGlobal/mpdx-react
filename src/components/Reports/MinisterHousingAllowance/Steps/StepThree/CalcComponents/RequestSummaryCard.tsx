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
import { useAnnualTotal } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
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

  return (
    <Card>
      <CardHeader title={<b>{t('Your MHA Request Summary')}</b>} />
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
                  <Trans i18nKey="requestSummaryCardInfo">
                    This is calculated from your above responses and is the
                    lower of the Annual Fair Rental Value or the Annual Cost of
                    Providing a Home.
                  </Trans>
                </Box>
              </TableCell>
              <TableCell sx={{ width: '30%', fontSize: 16 }}>
                <b>
                  {currencyFormat(annualTotal, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
