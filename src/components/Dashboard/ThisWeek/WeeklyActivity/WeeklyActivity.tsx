import React, { ReactElement, useState } from 'react';
import {
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
} from '@mui/material';
import { makeStyles, withStyles } from 'tss-react/mui';
import { motion } from 'framer-motion';
import { DateTime, Interval } from 'luxon';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../../../AnimatedCard';
import { numberFormat } from '../../../../lib/intlFormat';
import HandoffLink from '../../../HandoffLink';
import { useGetWeeklyActivityQuery } from './GetWeeklyActivity.generated';
import { WeeklyReportModal } from './WeeklyReportModal/WeeklyReportModal';
import { useLocale } from 'src/hooks/useLocale';

const useStyles = makeStyles()((theme: Theme) => ({
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
}));

interface Props {
  accountListId: string;
}

const StyledTableCell = withStyles(TableCell, () => ({
  root: {
    paddingLeft: 4,
    paddingRight: 4,
  },
}));

const WeeklyActivity = ({ accountListId }: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();

  const [interval, setInterval] = useState(
    Interval.fromDateTimes(
      DateTime.local().set({ weekday: 0 }),
      DateTime.local().set({ weekday: 6 }),
    ),
  );

  const { data, loading } = useGetWeeklyActivityQuery({
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
      .toJSDate()
      .toLocaleDateString(locale, { day: 'numeric', month: 'short' });

  const [openWeeklyReportModal, setOpenWeeklyReportModal] =
    useState<boolean>(false);

  const onWeeklyReportOpen = () => {
    setOpenWeeklyReportModal(true);
  };

  const onWeeklyReportClose = () => {
    setOpenWeeklyReportModal(false);
  };

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
                <StyledTableCell data-testid="WeeklyActivityTableCellDateRange">
                  {`${intlDateFormat(interval.start)} - ${intlDateFormat(
                    interval.end,
                  )}`}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {t('Completed')}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {t('Appt Produced')}
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <StyledTableCell>{t('Calls')}</StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedCalls"
                >
                  {loading || !data ? (
                    <Skeleton
                      variant="text"
                      data-testid="WeeklyActivitySkeletonLoading"
                    />
                  ) : (
                    numberFormat(data.completedCalls.totalCount, locale)
                  )}
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellCallsThatProducedAppointments"
                >
                  {loading || !data ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(
                      data.callsThatProducedAppointments.totalCount,
                      locale,
                    )
                  )}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>{t('Messages')}</StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedMessages"
                >
                  {loading || !data ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.completedMessages.totalCount, locale)
                  )}
                </StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellMessagesThatProducedAppointments"
                >
                  {loading || !data ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(
                      data.messagesThatProducedAppointments.totalCount,
                      locale,
                    )
                  )}
                </StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>{t('Appointments')}</StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedAppointments"
                >
                  {loading || !data ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(data.completedAppointments.totalCount, locale)
                  )}
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </TableRow>
              <TableRow>
                <StyledTableCell>{t('Correspondence')}</StyledTableCell>
                <StyledTableCell
                  align="right"
                  data-testid="WeeklyActivityTableCellCompletedCorrespondence"
                >
                  {loading || !data ? (
                    <Skeleton variant="text" />
                  ) : (
                    numberFormat(
                      data.completedCorrespondence.totalCount,
                      locale,
                    )
                  )}
                </StyledTableCell>
                <StyledTableCell></StyledTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <HandoffLink path="/reports/coaching">
            <Button size="small" color="primary">
              {t('View Activity Detail')}
            </Button>
          </HandoffLink>
          <Button size="small" color="primary" onClick={onWeeklyReportOpen}>
            {t('Fill out weekly report')}
          </Button>
          <WeeklyReportModal
            accountListId={accountListId}
            open={openWeeklyReportModal}
            onClose={onWeeklyReportClose}
          />
        </CardActions>
      </motion.div>
    </AnimatedCard>
  );
};

export default WeeklyActivity;
