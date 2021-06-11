import React from 'react';
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
) {
  return { contact, contactId, status, commitment, frequency, converted };
}

const rows = [
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
  createData(
    'Adriano, Selinda',
    'abc',
    'Partner - Financial',
    '50 CAD',
    'Monthly',
    '50 CAD',
  ),
];

export const ExpectedMonthlyTotalReportTable: React.FC<Props> = () => {
  const { t } = useTranslation();
  return (
    <Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{t('Possible Partners This Month')}</Typography>
          <Typography style={{ align: 'right' }}>{t('3920 CAD')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table style={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <TableCellWrapper>{t('Partner')}</TableCellWrapper>
                  <TableCellWrapper align="right">
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
                {rows.map((row) => (
                  <TableRow key={row.contact}>
                    <TableCellWrapper>
                      <Link href="../../../pages/accountLists/[accountListId]/contacts/[[...contactId]].page.tsx">
                        {row.contact}
                      </Link>
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.status}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.commitment}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.frequency}
                    </TableCellWrapper>
                    <TableCellWrapper align="right">
                      {row.converted}
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
