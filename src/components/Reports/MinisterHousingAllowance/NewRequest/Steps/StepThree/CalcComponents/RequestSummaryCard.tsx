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
import { Trans, useTranslation } from 'react-i18next';
import { RentOwnEnum } from 'src/components/Reports/MinisterHousingAllowance/Shared/sharedTypes';

interface RequestSummaryCardProps {
  rentOrOwn: RentOwnEnum;
}

export const RequestSummaryCard: React.FC<RequestSummaryCardProps> = ({
  rentOrOwn = RentOwnEnum.Own,
}) => {
  const { t } = useTranslation();

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
            <TableRow>
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
              <TableCell sx={{ width: '30%' }}>
                <b>{t('$0')}</b>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
