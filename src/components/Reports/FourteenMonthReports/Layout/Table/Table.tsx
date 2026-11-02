import NextLink from 'next/link';
import React, { useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import SwipeIcon from '@mui/icons-material/Swipe';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { preloadContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { useContactPanel } from 'src/components/Shared/ContactPanelProvider/ContactPanelProvider';
import { useLocale } from 'src/hooks/useLocale';
import { useLocalizedConstants } from 'src/hooks/useLocalizedConstants';
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

export interface FourteenMonthReportTableProps extends TableHeadProps {
  isExpanded: boolean;
  orderedContacts: Contact[];
  totals: MonthTotal[];
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

const PrintableContainer = styled(TableContainer)(({ theme }) => ({
  // First style sets size as landscape
  '@media print': {
    '@page': { size: 'landscape' },
  },
  // On phones, keep the Partner column pinned while the months scroll sideways
  [theme.breakpoints.down('sm')]: {
    '.MuiTableCell-root': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    '.MuiTableCell-root:first-of-type': {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      minWidth: 150,
      backgroundColor: theme.palette.background.paper,
      boxShadow: `inset -1px 0 0 ${theme.palette.divider}`,
    },
    '.MuiTableHead-root .MuiTableCell-root:first-of-type': {
      zIndex: 3,
    },
    '.MuiTableRow-hover:hover .MuiTableCell-root:first-of-type': {
      backgroundImage: `linear-gradient(${theme.palette.action.hover}, ${theme.palette.action.hover})`,
    },
  },
}));

const ScrollHint = styled(Typography)(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  paddingInline: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
  '@media print': {
    display: 'none',
  },
}));

const NameLink = styled(Link)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'inline-block',
    minHeight: 24,
    lineHeight: '24px',
  },
})) as typeof Link;

const StyledInfoIcon = styled(InfoIcon)({
  '@media print': {
    display: 'none',
  },
});

const CircleBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'lateBy60Days',
})(({ lateBy60Days = false }: { lateBy60Days?: boolean }) => ({
  backgroundColor: lateBy60Days ? 'red' : 'orange',
  width: 15,
  height: 15,
  borderRadius: '50%',
  flex: 'none',
  marginLeft: 'auto',
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
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const apiConstants = useApiConstants();
  const { getLocalizedContactStatus } = useLocalizedConstants();
  const { buildContactUrl } = useContactPanel();

  const totalAverage = useMemo(
    () =>
      Math.round(
        orderedContacts?.reduce((sum, contact) => sum + contact.average, 0) ??
          0,
      ),
    [orderedContacts],
  );
  const totalMinimum = useMemo(
    () =>
      Math.round(
        orderedContacts?.reduce((sum, contact) => sum + contact.minimum, 0) ??
          0,
      ),
    [orderedContacts],
  );
  // The completeMonthsTotal field is calculated by the server and is total the contact's donations
  // during complete months. For example, on January 15th, 2026 this would be the sum of donations
  // during 2025. We exclude incomplete months since the partner might not have given their monthly
  // gift yet on January 15th.
  const totalCompleteMonths = useMemo(
    () =>
      Math.round(
        orderedContacts?.reduce(
          (sum, contact) => sum + contact.completeMonthsTotal,
          0,
        ) ?? 0,
      ),
    [orderedContacts],
  );

  return (
    <Box>
      <ScrollHint variant="body2" color="textSecondary">
        <SwipeIcon fontSize="small" />
        {t('Scroll sideways to see every month and the 12 month total.')}
      </ScrollHint>
      <PrintableContainer className="fourteen-month-report">
        <Table
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
            {orderedContacts.map((contact) => (
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
                        <NameLink
                          component={NextLink}
                          href={buildContactUrl(contact.id)}
                          onMouseEnter={preloadContactsRightPanel}
                        >
                          {contact.name}
                        </NameLink>
                      </NameTypography>
                      {(contact.lateBy30Days || contact.lateBy60Days) && (
                        <Tooltip
                          title={t('{{daysLate}}+ days late', {
                            daysLate: contact.lateBy60Days ? '60' : '30',
                          })}
                          arrow
                        >
                          <CircleBox
                            lateBy60Days={contact.lateBy60Days}
                            data-testid={`lateCircle${
                              contact.lateBy60Days ? '60' : '30'
                            }`}
                          />
                        </Tooltip>
                      )}
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
                    <StyledTableCell>
                      {getLocalizedContactStatus(
                        contact?.status?.toUpperCase(),
                      )}
                    </StyledTableCell>
                    <StyledTableCell data-testid="pledgeAmount">
                      {contact.pledgeAmount &&
                        `${numberFormat(
                          Math.round(contact.pledgeAmount),
                          locale,
                        )} ${contact.pledgeCurrency} ${
                          apiConstants?.pledgeFrequency.find(
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
                {contact.months.map((month) => (
                  <StyledTableCell key={month.month} align="center">
                    {numberFormat(Math.round(month.total), locale)}
                  </StyledTableCell>
                ))}
                <StyledTableCell align="right">
                  <strong data-testid="totalGivenByContact">
                    {numberFormat(
                      Math.round(contact.completeMonthsTotal),
                      locale,
                    )}
                  </strong>
                </StyledTableCell>
              </TableRow>
            ))}
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
                {numberFormat(totalCompleteMonths, locale)}
              </StyledTableCell>
            </StyledTotalsRow>
          </TableBody>
        </Table>
      </PrintableContainer>
    </Box>
  );
};
