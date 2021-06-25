/* eslint-disable import/no-unresolved */
import React, { useMemo } from 'react';
import clsx from 'clsx';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Grid,
  styled,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import CodeIcon from '@material-ui/icons/Code';
import PrintIcon from '@material-ui/icons/Print';
import { CSVLink } from 'react-csv';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { FourteenMonthReportCurrencyType } from '../../../../graphql/types.generated';
// eslint-disable-next-line import/extensions
import { useFourteenMonthReportQuery } from 'pages/accountLists/[accountListId]/reports/graphql/GetReportFourteenMonth.generated';
import { Notification } from 'src/components/Notification/Notification';
import { EmptyReport } from 'src/components/Reports/EmptyReport/EmptyReport';

interface Props {
  className?: string;
  accountListId: string;
  title: string;
}

const useStyles = makeStyles(() => ({
  root: {},
}));

const DownloadCsvLink = styled(CSVLink)(({}) => ({
  color: 'inherit',
  textDecoration: 'none',
}));

const YearTableCell = styled(TableCell)(({}) => ({
  paddingLeft: 0,
}));

const YearTypography = styled(Typography)(({ theme }) => ({
  borderLeft: `1px solid ${theme.palette.cruGrayLight.main}`,
}));

export const SalaryReportTable: React.FC<Props> = ({
  className,
  accountListId,
  title,
  ...rest
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { data, loading, error } = useFourteenMonthReportQuery({
    variables: {
      accountListId,
      currencyType: FourteenMonthReportCurrencyType.Salary,
    },
  });

  const salaryCurrency = data?.fourteenMonthReport.salaryCurrency;
  const currencyGroups = data?.fourteenMonthReport.currencyGroups;

  const contacts = useMemo(() => {
    return currencyGroups?.flatMap((currencyGroup) => [
      ...currencyGroup?.contacts,
    ]);
  }, [currencyGroups]);

  return (
    <Box>
      <Box my={2}>
        <Grid
          container
          justify="space-between"
          className={clsx(classes.root, className)}
          {...rest}
        >
          <Grid item>
            <Typography variant="h5">{t(title)}</Typography>
          </Grid>
          <Grid item>
            <ButtonGroup aria-label="report header button group">
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <CodeIcon />
                  </SvgIcon>
                }
              >
                {t('Expand Partner Info')}
              </Button>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <GetAppIcon />
                  </SvgIcon>
                }
              >
                <DownloadCsvLink
                  data={contacts ? contacts : []}
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
              >
                {t('Print')}
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>
      {loading ? (
        <CircularProgress data-testid="LoadingSalaryReport" />
      ) : error ? (
        <Notification type="error" message={error.toString()} />
      ) : currencyGroups?.length === 0 ? (
        <EmptyReport
          title={t(
            'You have received no donations in the last thirteen months',
          )}
          subTitle={t(
            'You can setup an organization account to import them or add a new donation.',
          )}
        />
      ) : (
        <TableContainer>
          <Table data-testid="SalaryReportTable">
            <TableHead data-testid="SalaryReportTableHead">
              <TableRow>
                <TableCell>
                  <Typography variant="h6">{salaryCurrency}</Typography>
                </TableCell>
                {currencyGroups?.map((currencyGroup) => {
                  const allYears = currencyGroup.totals.months.map(
                    (month) => month.month.split('-')[0],
                  );
                  const monthCount = allYears.reduce<{
                    [key: string]: number;
                  }>(
                    (count, year) => ({
                      ...count,
                      [year]: (count[year] || 0) + 1,
                    }),
                    {},
                  );

                  return Object.entries(monthCount).map(([year, count]) => (
                    <YearTableCell key={year} colSpan={count} align="center">
                      <YearTypography variant="h6">{year}</YearTypography>
                    </YearTableCell>
                  ));
                })}
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell>{t('Partner')}</TableCell>
                {currencyGroups?.map((currencyGroup) =>
                  currencyGroup.totals.months.map((month) => (
                    <TableCell key={month.month} align="center">
                      {DateTime.fromISO(month.month).toFormat('LLL')}
                    </TableCell>
                  )),
                )}
                <TableCell align="right">{t('Total')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts?.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>{contact.name}</TableCell>
                  {contact.months?.map((month) => (
                    <TableCell key={month.month} align="center">
                      {Math.round(month.salaryCurrencyTotal)}
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
                {currencyGroups?.map((currencyGroup) =>
                  currencyGroup.totals.months.map((month) => (
                    <TableCell key={month.month} align="center">
                      <strong>{Math.round(month.total)}</strong>
                    </TableCell>
                  )),
                )}
                <TableCell align="right" />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
