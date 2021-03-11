import React, { ReactElement, useState, useEffect } from 'react';
import {
  makeStyles,
  Theme,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@material-ui/core';
import { motion } from 'framer-motion';
import { DateTime, Interval } from 'luxon';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../../../AnimatedCard';
import { numberFormat } from '../../../../lib/intlFormat';
import HandoffLink from '../../../HandoffLink';
import { useGetWeeklyActivityQuery } from './GetWeeklyActivity.generated';

const useStyles = makeStyles((theme: Theme) => ({
  div: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '322px',
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
    },
  },
  cardHeader: {
    height: '58px',
    padding: theme.spacing(0, 2),
  },
  cardHeaderAction: {
    alignSelf: 'inherit',
    marginTop: 0,
  },
  tableContainer: {
    flex: 1,
  },
  tableCell: {
    paddingLeft: 4,
    paddingRight: 4,
  },
}));

interface Props {
  accountListId: string;
}

const WeeklyActivity = ({ accountListId }: Props): ReactElement => {
  const classes = useStyles();
  const { t, i18n } = useTranslation();

  const [interval, setInterval] = useState(
    Interval.fromDateTimes(
      DateTime.local().set({ weekday: 0 }),
      DateTime.local().set({ weekday: 6 }),
    ),
  );

  const { data, loading, refetch } = useGetWeeklyActivityQuery({
    variables: {
      accountListId,
      startOfWeek: interval.start.toISO(),
      endOfWeek: interval.end.toISO(),
    },
  });

  const addWeek = (): void =>
    setInterval((interval) =>
      interval.mapEndpoints((endpoint) => endpoint.plus({ week: 1 })),
    );

  const subtractWeek = (): void =>
    setInterval((interval) =>
      interval.mapEndpoints((endpoint) => endpoint.minus({ week: 1 })),
    );

  const intlDateFormat = (date: DateTime): string =>
    date
      .setLocale(i18n.language)
      .toLocaleString({ day: 'numeric', month: 'short' });

  useEffect(() => {
    refetch({
      accountListId,
      startOfWeek: interval.start.toISO(),
      endOfWeek: interval.end.toISO(),
    });
  }, [interval]);

  return (
    <AnimatedCard className={classes.card}>
      <CardHeader
        title={t('Weekly Activity')}
        action={
          <>
            <IconButton
              onClick={subtractWeek}
              data-testid="WeeklyActivityIconButtonSubtractWeek"
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={addWeek}
              data-testid="WeeklyActivityIconButtonAddWeek"
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        }
        classes={{ root: classes.cardHeader, action: classes.cardHeaderAction }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={classes.div}
      >
        <TableContainer component="div" className={classes.tableContainer}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  className={classes.tableCell}
                  data-testid="WeeklyActivityTableCellDateRange"
                >
                  {`${intlDateFormat(interval.start)} - ${intlDateFormat(
                    interval.end,
                  )}`}
                </TableCell>
                <TableCell align="right" className={classes.tableCell}>
                  {t('Completed')}
                </TableCell>
                <TableCell align="right" className={classes.tableCell}>
                  {t('Appt Produced')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className={classes.tableCell}>
                  {t('Calls')}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedCalls"
                >
                  {loading ? (
                    <Skeleton
                      variant="text"
                      data-testid="WeeklyActivitySkeletonLoading"
                    />
                  ) : (
                    numberFormat(data.completedCalls.totalCount)
                  )}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellCallsThatProducedAppointments"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.callsThatProducedAppointments.totalCount)
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.tableCell}>
                  {t('Messages')}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedMessages"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.completedMessages.totalCount)
                  )}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellMessagesThatProducedAppointments"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(
                      data.messagesThatProducedAppointments.totalCount,
                    )
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.tableCell}>
                  {t('Appointments')}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedAppointments"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.completedAppointments.totalCount)
                  )}
                </TableCell>
                <TableCell className={classes.tableCell}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.tableCell}>
                  {t('Correspondence')}
                </TableCell>
                <TableCell
                  className={classes.tableCell}
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedCorrespondence"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.completedCorrespondence.totalCount)
                  )}
                </TableCell>
                <TableCell className={classes.tableCell}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <CardActions>
          <HandoffLink path="/reports/coaching">
            <Button size="small" color="primary">
              {t('View Activity Detail')}
            </Button>
          </HandoffLink>
        </CardActions>
      </motion.div>
    </AnimatedCard>
  );
};

export default WeeklyActivity;
