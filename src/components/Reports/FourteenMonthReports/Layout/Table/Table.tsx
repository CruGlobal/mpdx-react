import React, { useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useLocale } from 'src/hooks/useLocale';
import theme from 'src/theme';
import { numberFormat } from '../../../../../lib/intlFormat';
import { useApiConstants } from '../../../../Constants/UseApiConstants';
import { MonthTotal } from '../../FourteenMonthReport';
import { StyledTableCell } from './StyledComponents';
import {
  FourteenMonthReportTableHead as TableHead,
  FourteenMonthReportTableHeadProps as TableHeadProps,
} from './TableHead/TableHead';
import type { Contact } from './TableHead/TableHead';

interface FourteenMonthReportTableProps extends TableHeadProps {
  isExpanded: boolean;
  orderedContacts: Contact[] | undefined;
  totals: MonthTotal[];
  onSelectContact: (contactId: string) => void;
}

const NameTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})(({ expanded }: { expanded: boolean }) => ({
  marginLeft: expanded ? 0 : theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
  '@media print': {
    fontSize: '14px',
  },
}));

const PrintableContainer = styled(TableContainer)(() => ({
  // First style set size as landscape
  height: 'calc(100vh - 160px)',
  '@media print': {
    ['@page']: { size: 'landscape' },
    overflow: 'auto',
    height: '100%',
  },
}));

const StickyTable = styled(Table)(({}) => ({
  height: 'calc(100vh - 96px)',
  '@media print': {
    overflow: 'auto',
    height: '100%',
  },
}));

const StyledInfoIcon = styled(InfoIcon)(({}) => ({
  '@media print': {
    display: 'none',
  },
}));

const StyledTotalsRow = styled(TableRow)({
  '.MuiTableCell-root': {
    fontWeight: 'bold',
  },
});

export const FourteenMonthReportTable: React.FC<
  FourteenMonthReportTableProps
> = ({
  isExpanded,
  order,
  orderBy,
  totals,
  orderedContacts,
  onRequestSort,
  salaryCurrency,
  onSelectContact,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const apiConstants = useApiConstants();

  const totalAverage = useMemo(
    () =>
      Math.round(
        orderedContacts?.reduce(
          (totalAverage, contact) => totalAverage + contact.average,
          0,
        ) ?? 0,
      ),
    [orderedContacts],
  );
  const totalMinimum = useMemo(
    () =>
      Math.round(
        orderedContacts?.reduce(
          (totalMinimum, contact) => totalMinimum + contact.minimum,
          0,
        ) ?? 0,
      ),
    [orderedContacts],
  );

  return (
    <PrintableContainer className="fourteen-month-report">
      <StickyTable
        stickyHeader={true}
        aria-label={t('Fourteen month report table')}
        data-testid="FourteenMonthReport"
      >
        <TableHead
          isExpanded={isExpanded}
          salaryCurrency={salaryCurrency}
          totals={totals}
          order={order}
          orderBy={orderBy}
          onRequestSort={onRequestSort}
        />
        <TableBody>
          {orderedContacts?.map((contact) => {
            const totalDonated = useMemo(() => {
              if (contact?.months) {
                return contact.months.reduce((partialSum, month) => {
                  return partialSum + month.salaryCurrencyTotal;
                }, 0);
              } else {
                return 0;
              }
            }, [contact]);
            return (
              <TableRow
                key={contact.id}
                hover
                data-testid="FourteenMonthReportTableRow"
              >
                <StyledTableCell>
                  <Box display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center">
                      {!isExpanded && <StyledInfoIcon fontSize="small" />}
                      <NameTypography variant="body1" expanded={isExpanded}>
                        <Link
                          onClick={() => onSelectContact(contact.id)}
                          onMouseEnter={preloadContactsRightPanel}
                          underline="hover"
                        >
                          {contact.name}
                        </Link>
                      </NameTypography>
                    </Box>
                    {isExpanded && (
                      <Typography variant="body2" color="textSecondary">
                        {contact.accountNumbers.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </StyledTableCell>
                {isExpanded && (
                  <>
                    <StyledTableCell>{contact.status}</StyledTableCell>
                    <StyledTableCell data-testid="pledgeAmount">
                      {contact.pledgeAmount &&
                        `${numberFormat(
                          Math.round(contact.pledgeAmount),
                          locale,
                        )} ${contact.pledgeCurrency} ${
                          apiConstants?.pledgeFrequency?.find(
                            ({ key }) => key === contact.pledgeFrequency,
                          )?.value ?? ''
                        }`}
                    </StyledTableCell>
                    <StyledTableCell>
                      {numberFormat(Math.round(contact.average), locale)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {numberFormat(Math.round(contact.minimum), locale)}
                    </StyledTableCell>
                  </>
                )}
                {contact.months?.map((month) => (
                  <StyledTableCell key={month.month} align="center">
                    {month?.salaryCurrencyTotal &&
                      numberFormat(
                        Math.round(month?.salaryCurrencyTotal),
                        locale,
                      )}
                  </StyledTableCell>
                ))}
                <StyledTableCell align="right">
                  <strong data-testid="totalGivenByContact">
                    {numberFormat(Math.round(totalDonated), locale)}
                  </strong>
                </StyledTableCell>
              </TableRow>
            );
          })}
          <StyledTotalsRow>
            <StyledTableCell>{t('Totals')}</StyledTableCell>
            {isExpanded && (
              <>
                <StyledTableCell />
                <StyledTableCell />
                <StyledTableCell data-testid="averageTotal">
                  {numberFormat(totalAverage, locale)}
                </StyledTableCell>
                <StyledTableCell data-testid="minimumTotal">
                  {numberFormat(totalMinimum, locale)}
                </StyledTableCell>
              </>
            )}
            {totals?.map((month) => (
              <StyledTableCell
                key={month.month}
                align="center"
                data-testid="monthlyTotals"
              >
                {numberFormat(Math.round(month.total), locale)}
              </StyledTableCell>
            ))}
            <StyledTableCell align="right" data-testid="overallTotal">
              {numberFormat(
                Math.round(
                  totals?.reduce((sum, month) => sum + month.total, 0) ?? 0,
                ),
                locale,
              )}
            </StyledTableCell>
          </StyledTotalsRow>
        </TableBody>
      </StickyTable>
    </PrintableContainer>
  );
};
