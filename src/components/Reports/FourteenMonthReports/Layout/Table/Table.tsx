import React, { FC, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import { Info as InfoIcon } from '@material-ui/icons';
import {
  FourteenMonthReportTableHead as TableHead,
  FourteenMonthReportTableHeadProps as TableHeadProps,
} from './TableHead/TableHead';
import type { Contact, Month } from './TableHead/TableHead';

interface FourteenMonthReportTableProps extends TableHeadProps {
  isExpanded: boolean;
  orderedContacts: Contact[] | undefined;
  ref: React.Ref<HTMLTableElement>;
}

const NameTypography = styled(({ expanded: _expanded, ...props }) => (
  <Typography {...props} />
))(({ theme, expanded }: { theme: Theme; expanded: boolean }) => ({
  marginLeft: expanded ? 0 : theme.spacing(1),
}));

const PrintableContainer = styled(TableContainer)(() => ({
  // First style set size as landscape
  // ['@media print']: {
  //   ['@page']: { size: 'landscape' },
  // },
  height: 'calc(100vh - 160px)',
}));

const StickyTable = styled(Table)(({}) => ({
  height: 'calc(100vh - 96px)',
}));

// eslint-disable-next-line react/display-name
export const FourteenMonthReportTable: FC<FourteenMonthReportTableProps> = forwardRef(
  (
    {
      isExpanded,
      order,
      orderBy,
      orderedContacts,
      onRequestSort,
      salaryCurrency,
      totals,
    },
    ref,
  ) => {
    const { t } = useTranslation();

    return (
      <PrintableContainer innerRef={ref}>
        <StickyTable
          stickyHeader={true}
          aria-label="fourteen month report table"
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
            {orderedContacts?.map((contact) => (
              <TableRow key={contact.id} hover>
                <TableCell>
                  <Box display="flex" flexDirection="column">
                    <Box display="flex" alignItems="center">
                      {!isExpanded && <InfoIcon fontSize="small" />}
                      <NameTypography variant="body1" expanded={isExpanded}>
                        {contact.name}
                      </NameTypography>
                    </Box>
                    {isExpanded && (
                      <Typography variant="body2" color="textSecondary">
                        {contact.accountNumbers.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                {isExpanded && (
                  <React.Fragment>
                    <TableCell>{contact.status}</TableCell>
                    <TableCell>
                      {contact.pledgeAmount && Math.round(contact.pledgeAmount)}
                    </TableCell>
                    <TableCell>{Math.round(contact.average)}</TableCell>
                    <TableCell>{Math.round(contact.minimum)}</TableCell>
                  </React.Fragment>
                )}
                {contact.months?.map((month: Month) => (
                  <TableCell key={month?.month} align="center">
                    {month?.salaryCurrencyTotal &&
                      Math.round(month?.salaryCurrencyTotal)}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <strong>{Math.round(contact.total)}</strong>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <strong>{t('Totals')}</strong>
              </TableCell>
              {totals?.months?.map((month) => (
                <TableCell key={month.month} align="center">
                  <strong>{Math.round(month.total)}</strong>
                </TableCell>
              ))}
              <TableCell align="right" />
            </TableRow>
          </TableBody>
        </StickyTable>
      </PrintableContainer>
    );
  },
);
