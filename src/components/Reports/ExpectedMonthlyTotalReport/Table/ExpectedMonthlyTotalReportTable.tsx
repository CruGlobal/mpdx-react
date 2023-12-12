import React, { useState } from 'react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExpectedDonationRowFragment } from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from '../../../../theme';

interface Props {
  accountListId: string;
  title: string;
  data: ExpectedDonationRowFragment[];
  donations: boolean;
  total: number;
  currency: string;
}

export const ExpectedMonthlyTotalReportTable: React.FC<Props> = ({
  accountListId,
  title,
  data,
  donations,
  total,
  currency,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const [visible, setVisible] = useState(true);

  const showTotalPartners = () => {
    if (visible) {
      return data.length > 1
        ? t('Show {{partnerCount}} Partners', { partnerCount: data.length })
        : t('Show 1 Partner');
    }
  };

  const isEmpty = data.length === 0;

  return !isEmpty ? (
    <Box
      style={{
        maxWidth: '98%',
        padding: 4,
        margin: 'auto',
      }}
    >
      <Accordion style={{ marginLeft: 0 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          style={{
            backgroundColor: theme.palette.cruGrayLight.main,
          }}
          onClick={() => setVisible((v) => !v)}
        >
          <Typography>{t(title)}</Typography>
          <Typography
            style={{ fontSize: 12, margin: 4 }}
            data-testid="totalPartners"
          >
            {showTotalPartners()}
          </Typography>
          <Typography style={{ marginLeft: 'auto' }}>
            {currencyFormat(total, currency, locale)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table
              style={{ minWidth: 700 }}
              aria-label={t('Expected monthly total report table')}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="left">{t('Partner')}</TableCell>
                  <TableCell align="left">{t('Status')}</TableCell>
                  <TableCell align="right">{t('Commitment')}</TableCell>
                  <TableCell align="right">{t('Frequency')}</TableCell>
                  {donations ? (
                    <TableCell align="right">{t('Donation')}</TableCell>
                  ) : null}
                  <TableCell align="right">{t('Converted')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={`${row.contactId}${index}`}
                    style={{
                      backgroundColor:
                        index % 2
                          ? theme.palette.common.white
                          : theme.palette.cruGrayLight.main,
                    }}
                  >
                    <TableCell align="left">
                      <Link
                        href={`../../${accountListId}/contacts/${row.contactId}`}
                        underline="hover"
                      >
                        {row.contactName}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{row.contactStatus}</TableCell>
                    <TableCell align="right">
                      {currencyFormat(
                        row.pledgeAmount || 0,
                        row.pledgeCurrency,
                        locale,
                      )}
                    </TableCell>
                    <TableCell align="right">{row.pledgeFrequency}</TableCell>
                    {donations ? (
                      <TableCell data-testid="donationColumn" align="right">
                        {currencyFormat(
                          row.donationAmount || 0,
                          row.donationCurrency,
                          locale,
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell align="right">
                      {currencyFormat(
                        row.convertedAmount || 0,
                        row.convertedCurrency,
                        locale,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  ) : null;
};
