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

interface Props {
  accountListId: string;
}

const TableCellWrapper = styled(TableCell)(({}) => ({
  fontSize: 14,
}));

function createData(
  contact: string,
  contactId: string,
  status: string,
  commitment: string,
  frequency: string,
  converted: string,
  currency: string,
) {
  return {
    contact,
    contactId,
    status,
    commitment,
    frequency,
    converted,
    currency,
  };
}

const rows = [
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50',
    'Monthly',
    '50',
    'CAD',
  ),
];

export const ExpectedMonthlyTotalReportTable: React.FC<Props> = () => {
  const { t } = useTranslation();

  const totalPartners = () => {
    return 25;
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
    <Box>
      <Accordion onClick={() => setVisible((v) => !v)}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{t('Possible Partners This Month')}</Typography>
          <Typography style={{ fontSize: 12, margin: 4 }}>
            {showTotalPartners()}
          </Typography>
          <Typography>{total()}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table style={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <TableCellWrapper align="left">
                    {t('Partner')}
                  </TableCellWrapper>
                  <TableCellWrapper align="left">
                    {t('Status')}
                  </TableCellWrapper>
                  <TableCellWrapper align="right">
                    {t('Commitment')}
                  </TableCellWrapper>
                  <TableCellWrapper align="right">
                    {t('Frequency')}
                  </TableCellWrapper>
                  <TableCellWrapper align="right">
                    {t('Converted')}
                  </TableCellWrapper>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.contact}
                    style={{
                      backgroundColor: index % 2 ? '#f0f0f0' : 'white',
                    }}
                  >
                    <TableCellWrapper align="left">
                      <Link href="../../../pages/accountLists/[accountListId]/contacts/[[...contactId]].page.tsx">
                        {row.contact}
                      </Link>
                    </TableCellWrapper>
                    <TableCellWrapper align="left">
                      {row.status}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.commitment + ' ' + row.currency}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.frequency}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.converted + ' ' + row.currency}
                    </TableCellWrapper>
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
