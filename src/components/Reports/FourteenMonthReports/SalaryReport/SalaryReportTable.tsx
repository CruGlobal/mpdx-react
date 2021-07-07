/* eslint-disable import/no-unresolved */
import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Grid,
  IconButton,
  styled,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { FilterList, Info as InfoIcon } from '@material-ui/icons';
import GetAppIcon from '@material-ui/icons/GetApp';
import CodeIcon from '@material-ui/icons/Code';
import PrintIcon from '@material-ui/icons/Print';
import { CSVLink } from 'react-csv';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import { FourteenMonthReportTableHead } from '../TableHead/TableHead';
import type { Contact, Month, Order, OrderBy } from '../TableHead/TableHead';
// eslint-disable-next-line import/extensions
import { useFourteenMonthReportQuery } from '../GetFourteenMonthReport.generated';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

const StickyHeader = styled(Box)(({}) => ({
  position: 'sticky',
  top: 0,
  height: 96,
}));

const HeaderTitle = styled(Typography)(({}) => ({
  lineHeight: 1.1,
}));

const NameTypography = styled(Typography)(
  ({ theme, expanded }: { theme: Theme; expanded: 1 | 0 }) => ({
    marginLeft: expanded === 1 ? 0 : theme.spacing(1),
  }),
);

const DownloadCsvLink = styled(CSVLink)(({}) => ({
  color: 'inherit',
  textDecoration: 'none',
}));

const NavListButton = styled(IconButton)(
  ({ theme, panelopen }: { theme: Theme; panelopen: 1 | 0 }) => ({
    display: 'inline-block',
    width: 48,
    height: 48,
    borderradius: 24,
    margin: theme.spacing(1),
    backgroundColor:
      panelopen === 1 ? theme.palette.secondary.dark : 'transparent',
  }),
);

const NavListIcon = styled(FilterList)(({ theme }) => ({
  width: 24,
  height: 24,
  color: theme.palette.primary.dark,
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

// function descendingComparator(
//   a: Contact,
//   b: Contact,
//   orderBy: OrderBy | number,
// ) {
//   if (orderBy === 'total' || orderBy === 'name') {
//     return a[orderBy].localeCompare(b[orderBy]);
//   } else {
//     const monthIdx = orderBy;

//     if (a.months && b.months) {
//       if (b.months[monthIdx]['total'] < a.months[monthIdx]['total']) {
//         return -1;
//       }
//       if (b.months[monthIdx]['total'] > a.months[monthIdx]['total']) {
//         return 1;
//       }
//     }
//   }

//   return 0;
// }

// function getComparator(
//   order: Order,
//   orderBy: OrderBy | number,
// ): (a: Contact, b: Contact) => number {
//   return order === 'desc'
//     ? (a, b) => descendingComparator(a, b, orderBy)
//     : (a, b) => -descendingComparator(a, b, orderBy);
// }

// function stableSort(
//   array: Contact[],
//   comparator: (a: Contact, b: Contact) => number,
// ) {
//   const stabilizedThis = array.map(
//     (el, index) => [el, index] as [Contact, number],
//   );
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   return stabilizedThis.map((el) => el[0]);
// }

export const SalaryReportTable: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  title,
  onNavListToggle,
  ...rest
}) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy | number | null>(null);
  const reportTableRef = useRef(null);
  const { t } = useTranslation();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm'),
  );

  const { data, loading, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
    },
  });

  const handlePrint = useReactToPrint({
    content: () => reportTableRef.current,
  });

  const contacts = useMemo(() => {
    return data?.fourteenMonthReport.currencyGroups?.flatMap(
      (currencyGroup) => [...currencyGroup?.contacts],
    );
  }, [data?.fourteenMonthReport.currencyGroups]);

  console.log(contacts);
  const orderedContacts = useMemo(() => {
    if (contacts && orderBy) {
      return contacts.sort((a: Contact, b: Contact) => {
        if (orderBy === 'name' || orderBy === 'total') {
          if (order === 'asc') {
            return a[orderBy]
              .toString()
              .localeCompare(b[orderBy].toString(), undefined, {
                numeric: true,
              });
          } else {
            return b[orderBy]
              .toString()
              .localeCompare(a[orderBy].toString(), undefined, {
                numeric: true,
              });
          }
        } else {
          if (typeof orderBy === 'number' && a.months && b.months) {
            if (order === 'asc') {
              return a['months'][orderBy]['total']
                .toString()
                .localeCompare(
                  b['months'][orderBy]['total'].toString(),
                  undefined,
                  {
                    numeric: true,
                  },
                );
            } else {
              return b['months'][orderBy]['total']
                .toString()
                .localeCompare(
                  a['months'][orderBy]['total'].toString(),
                  undefined,
                  {
                    numeric: true,
                  },
                );
            }
          }
        }
      });
      // return stableSort(contacts, getComparator(order, orderBy));
    } else {
      return contacts;
    }
  }, [contacts, order, orderBy]);

  const handleExpandToggle = (): void => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: OrderBy | number,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const CsvData = useMemo(() => {
    if (!contacts) return [];

    const monthsTitleArray = (type: 'month' | 'total') => {
      if (data) {
        return data.fourteenMonthReport.currencyGroups[0].totals.months.map(
          (month) => month[type],
        );
      } else {
        return [];
      }
    };
    return [
      [t('Currency'), data?.fourteenMonthReport.salaryCurrency],
      [t('Partner'), ...monthsTitleArray('month'), t('Total')],
      ...contacts.map((contact) => [
        contact.name,
        contact?.months?.map((month) => month.total) || [],
        contact.total,
      ]),
      [t('Totals'), monthsTitleArray('total')],
    ];
  }, [contacts]);

  return (
    <Box>
      <StickyHeader p={2}>
        <Grid
          container
          justify={isMobile ? 'center' : 'space-between'}
          spacing={2}
          {...rest}
        >
          <Grid item>
            <Box display="flex" alignItems="center">
              <NavListButton
                panelopen={isNavListOpen ? 1 : 0}
                onClick={onNavListToggle}
              >
                <NavListIcon titleAccess={t('Toggle Filter Panel')} />
              </NavListButton>
              <HeaderTitle variant="h5">{t(title)}</HeaderTitle>
            </Box>
          </Grid>
          <Grid item>
            <ButtonGroup aria-label="report header button group">
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <CodeIcon />
                  </SvgIcon>
                }
                onClick={handleExpandToggle}
              >
                {isExpanded ? t('Hide') : t('Expand')}
                {isMobile ? '' : t(' Partner Info')}
              </Button>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <GetAppIcon />
                  </SvgIcon>
                }
              >
                <DownloadCsvLink
                  data={CsvData}
                  filename={`mpdx-salary-contributions-export-${DateTime.now().toISODate()}.csv`}
                >
                  {t('Export')}
                </DownloadCsvLink>
              </Button>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <PrintIcon />
                  </SvgIcon>
                }
                onClick={handlePrint}
              >
                {t('Print')}
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </StickyHeader>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress data-testid="LoadingSalaryReport" />
        </Box>
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : data?.fourteenMonthReport.currencyGroups?.length === 0 ? (
        <EmptyReport
          title={t(
            'You have received no donations in the last thirteen months',
          )}
          subTitle={t(
            'You can setup an organization account to import them or add a new donation.',
          )}
        />
      ) : (
        <PrintableContainer innerRef={reportTableRef}>
          <StickyTable
            stickyHeader={true}
            aria-label="salary report table"
            data-testid="SalaryReportTable"
          >
            <FourteenMonthReportTableHead
              salaryCurrency={data?.fourteenMonthReport.salaryCurrency}
              totals={data?.fourteenMonthReport.currencyGroups[0].totals}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {orderedContacts?.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    <Box display="flex" flexDirection="column">
                      <Box display="flex" alignItems="center">
                        {!isExpanded && <InfoIcon fontSize="small" />}
                        <NameTypography
                          variant="body1"
                          expanded={isExpanded ? 1 : 0}
                        >
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
                {data?.fourteenMonthReport.currencyGroups?.map(
                  (currencyGroup) =>
                    currencyGroup.totals.months.map((month) => (
                      <TableCell key={month.month} align="center">
                        <strong>{Math.round(month.total)}</strong>
                      </TableCell>
                    )),
                )}
                <TableCell align="right" />
              </TableRow>
            </TableBody>
          </StickyTable>
        </PrintableContainer>
      )}
    </Box>
  );
};
