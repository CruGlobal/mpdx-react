import Link from 'next/link';
import React, { ReactElement, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Button,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { DateTime, Interval } from 'luxon';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { numberFormat } from '../../../../lib/intlFormat';
import AnimatedCard from '../../../AnimatedCard';
import { useGetWeeklyActivityQuery } from './GetWeeklyActivity.generated';
import {
  DynamicWeeklyReportModal,
  preloadWeeklyReportModal,
} from './WeeklyReportModal/DynamicWeeklyReportModal';

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
  cardContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  cardContentExpanded: {
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  tableContainer: {
    flex: 1,
  },
}));

interface Props {
  accountListId: string;
}

const StyledTableCell = styled(TableCell)({
  paddingInline: 4,
});

const WeeklyActivity = ({ accountListId }: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();

  const [interval, setInterval] = useState(
    Interval.fromDateTimes(
      DateTime.local().set({ localWeekday: 1 }),
      DateTime.local().set({ localWeekday: 7 }),
    ),
  );
  if (!interval.isValid) {
    throw new Error(`Invalid interval: ${interval.invalidReason}`);
  }

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
        <CardContent
          className={[classes.cardContent, classes.cardContentExpanded].join(
            ' ',
          )}
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
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <StyledTableCell>{t('Initiations')}</StyledTableCell>
                  <StyledTableCell
                    align="right"
                    data-testid="WeeklyActivityTableCellCompletedInitiations"
                  >
                    {loading || !data ? (
                      <Skeleton
                        sx={{ width: 20, float: 'right' }}
                        variant="text"
                        data-testid="WeeklyActivitySkeletonLoading"
                      />
                    ) : (
                      numberFormat(data.completedInitiations.totalCount, locale)
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
                      <Skeleton
                        sx={{ width: 20, float: 'right' }}
                        variant="text"
                      />
                    ) : (
                      numberFormat(
                        data.completedAppointments.totalCount,
                        locale,
                      )
                    )}
                  </StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{t('Follow-Up')}</StyledTableCell>
                  <StyledTableCell
                    align="right"
                    data-testid="WeeklyActivityTableCellCompletedFollowUps"
                  >
                    {loading || !data ? (
                      <Skeleton
                        sx={{ width: 20, float: 'right' }}
                        variant="text"
                      />
                    ) : (
                      numberFormat(data.completedFollowUps.totalCount, locale)
                    )}
                  </StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </TableRow>
                <TableRow>
                  <StyledTableCell>{t('Partner Care')}</StyledTableCell>
                  <StyledTableCell
                    align="right"
                    data-testid="WeeklyActivityTableCellCompletedPartnerCare"
                  >
                    {loading || !data ? (
                      <Skeleton
                        sx={{ width: 20, float: 'right' }}
                        variant="text"
                      />
                    ) : (
                      numberFormat(data.completedPartnerCare.totalCount, locale)
                    )}
                  </StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Link
            href={`/accountLists/${accountListId}/reports/coaching`}
            passHref
          >
            <Button size="small" color="primary">
              {t('View Activity Detail')}
            </Button>
          </Link>
          <Button
            size="small"
            color="primary"
            onClick={onWeeklyReportOpen}
            onMouseEnter={preloadWeeklyReportModal}
          >
            {t('Fill out weekly report')}
          </Button>
          {openWeeklyReportModal && (
            <DynamicWeeklyReportModal
              accountListId={accountListId}
              open
              onClose={onWeeklyReportClose}
            />
          )}
        </CardActions>
      </motion.div>
    </AnimatedCard>
  );
};

export default WeeklyActivity;
