import React, { useState } from 'react';
import {
  Box,
  Typography,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

interface Contact {
  contact: string;
  contactId: string;
  status: string;
  commitment: string;
  frequency: string;
  converted: string;
  currency: string;
  donation?: string;
}

interface Props {
  accountListId: string;
  title: string;
  data: Contact[];
  donations: boolean;
}

export const ExpectedMonthlyTotalReportTable: React.FC<Props> = ({
  accountListId,
  title,
  data,
  donations,
}) => {
  const { t } = useTranslation();

  const totalPartners = () => {
    return 6;
  };

  const [visible, setVisible] = useState(true);

  const total = () => {
    return 3920;
  };

  const showTotalPartners = () => {
    if (visible) {
      return t(' Show ' + totalPartners() + ' Partners');
    }
  };
  return (
    <Box
      style={{
        maxWidth: '98%',
        padding: 4,
        margin: 'auto',
      }}
    >
      <Accordion
        style={{ marginLeft: 0 }}
        onClick={() => setVisible((v) => !v)}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          style={{
            backgroundColor: '#f0f0f0',
          }}
        >
          <Typography>{t(title)}</Typography>
          <Typography style={{ fontSize: 12, margin: 4 }}>
            {showTotalPartners()}
          </Typography>
          <Typography style={{ marginLeft: 'auto' }}>
            {total() + ' CAD'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table style={{ minWidth: 700 }} aria-label="customized table">
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
                    key={row.contact}
                    style={{
                      backgroundColor: index % 2 ? 'white' : '#f0f0f0',
                    }}
                  >
                    <TableCell align="left">
                      <Link href="../../../pages/accountLists/[accountListId]/contacts/[[...contactId]].page.tsx">
                        {row.contact}
                      </Link>
                    </TableCell>
                    <TableCell align="left">{t(row.status)}</TableCell>
                    <TableCell align="right">
                      {row.commitment + ' ' + row.currency}
                    </TableCell>
                    <TableCell align="right">{t(row.frequency)}</TableCell>
                    {title[0] === 'D' ? (
                      <TableCell align="right">{row.donation}</TableCell>
                    ) : null}
                    <TableCell align="right">
                      {row.converted + ' ' + row.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
