import { InfoSharp } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Warning from '@mui/icons-material/Warning';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CardContent,
  LinearProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';

const StyledTableCell = styled(TableCell)(() => {
  return {
    fontWeight: 'normal',
  };
});

// TODO: Update all zero values to use real data --> not sure what fields are needed

export const TotalAnnualSalaryAccordion: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values } = useFormikContext<CompleteFormValues>();

  const { maxAmount } = useAdditionalSalaryRequest();

  const difference =
    Number(values.totalAdditionalSalaryRequested) - (maxAmount ?? 0);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: (theme) => alpha(theme.palette.warning.light, 0.1),
        }}
      >
        <Warning sx={{ mr: 1, color: 'warning.dark' }} />
        <Typography sx={{ fontWeight: 'bold', color: 'warning.dark', mr: 1 }}>
          {t('Total Annual Salary')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {t('A review of your income')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CardContent>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {t('Total Salary Requested')}
              </Typography>
              <InfoSharp sx={{ color: 'text.secondary' }} />
            </Box>
            <Typography>{`${currencyFormat(Number(values.totalAdditionalSalaryRequested), currency, locale)}/${currencyFormat(maxAmount ?? 0, currency, locale)}`}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={100} color="warning" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('Remaining in your Max Allowable Salary')}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {`-${currencyFormat(
                difference < 0 ? 0 : difference,
                currency,
                locale,
                { showTrailingZeros: true },
              )}`}
            </Typography>
          </Box>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '70%', fontWeight: 'normal' }}>
                  {t('Description')}
                </TableCell>
                <TableCell sx={{ width: '30%', fontWeight: 'normal' }}>
                  {t('Amount')}
                </TableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>
                  {t('Maximum Allowable Salary')}
                </StyledTableCell>
                <StyledTableCell>
                  {currencyFormat(0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>{t('Gross Annual Salary')}</StyledTableCell>
                <StyledTableCell>
                  {currencyFormat(0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>
                  <Typography variant="body2">
                    {t('Additional Salary Received This Year')}
                  </Typography>
                  <Typography variant="caption">
                    {t('Does not include payments received for backpay.')}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  {currencyFormat(0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>
                  <Typography variant="body2">
                    {t('Additional Salary on this Request')}
                  </Typography>
                  <Typography variant="caption">
                    {t('Does not include requests made for backpay.')}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell>
                  {currencyFormat(0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </StyledTableCell>
              </TableRow>
              <TableRow
                sx={{
                  '& td, & th': { borderBottom: 'none' },
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }}
              >
                <TableCell>{t('Total Annual Salary:')}</TableCell>
                <TableCell sx={{ color: 'warning.dark' }}>
                  {currencyFormat(0, currency, locale, {
                    showTrailingZeros: true,
                  })}
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );
};
