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
import { gql, useQuery } from '@apollo/client';
import { DateTime } from 'luxon';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import AnimatedCard from '../../../AnimatedCard';
import { GetWeeklyActivityQuery } from '../../../../../types/GetWeeklyActivityQuery';
import { numberFormat } from '../../../../lib/intlFormat';
import HandoffLink from '../../../HandoffLink';

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
}));

export const GET_WEEKLY_ACTIVITY_QUERY = gql`
    query GetWeeklyActivityQuery($accountListId: ID!, $startOfWeek: ISO8601DateTime!, $endOfWeek: ISO8601DateTime!) {
        completedCalls: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: CALL
            result: [COMPLETED, DONE]
        ) {
            totalCount
        }
        callsThatProducedAppointments: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: CALL
            result: [COMPLETED, DONE]
            nextAction: APPOINTMENT
        ) {
            totalCount
        }
        completedMessages: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: [EMAIL, FACEBOOK_MESSAGE, TEXT_MESSAGE]
            result: [COMPLETED, DONE]
        ) {
            totalCount
        }
        messagesThatProducedAppointments: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: [EMAIL, FACEBOOK_MESSAGE, TEXT_MESSAGE]
            result: [COMPLETED, DONE]
            nextAction: APPOINTMENT
        ) {
            totalCount
        }
        completedAppointments: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: APPOINTMENT
            result: [COMPLETED, DONE]
        ) {
            totalCount
        }
        completedCorrespondence: tasks(
            accountListId: $accountListId
            completedAt: { min: $startOfWeek, max: $endOfWeek }
            activityType: [PRE_CALL_LETTER, REMINDER_LETTER, SUPPORT_LETTER, THANK]
            result: [COMPLETED, DONE]
        ) {
            totalCount
        }
    }
`;

interface Props {
    accountListId: string;
}

const WeeklyActivity = ({ accountListId }: Props): ReactElement => {
    const classes = useStyles();
    const { t, i18n } = useTranslation();

    const [startOfWeek, setStartOfWeek] = useState(DateTime.local().startOf('week'));
    const [endOfWeek, setEndOfWeek] = useState(DateTime.local().endOf('week'));

    const { data, loading, refetch } = useQuery<GetWeeklyActivityQuery>(GET_WEEKLY_ACTIVITY_QUERY, {
        variables: {
            accountListId,
            startOfWeek: startOfWeek.toISO(),
            endOfWeek: endOfWeek.toISO(),
        },
    });

    const addWeek = (): void => {
        setStartOfWeek((startOfWeek) => startOfWeek.plus({ week: 1 }));
        setEndOfWeek((endOfWeek) => endOfWeek.plus({ week: 1 }));
    };

    const subtractWeek = (): void => {
        setStartOfWeek((startOfWeek) => startOfWeek.minus({ week: 1 }));
        setEndOfWeek((endOfWeek) => endOfWeek.minus({ week: 1 }));
    };

    const intlDateFormat = (date: DateTime): string =>
        date.setLocale(i18n.language).toLocaleString({ day: 'numeric', month: 'short' });

    useEffect(() => {
        refetch({
            accountListId,
            startOfWeek,
            endOfWeek,
        });
    }, [startOfWeek, endOfWeek]);

    return (
        <AnimatedCard className={classes.card}>
            <CardHeader
                title={t('Weekly Activity')}
                action={
                    <>
                        <IconButton onClick={subtractWeek} data-testid="WeeklyActivityIconButtonSubtractWeek">
                            <ArrowBackIcon />
                        </IconButton>
                        <IconButton onClick={addWeek} data-testid="WeeklyActivityIconButtonAddWeek">
                            <ArrowForwardIcon />
                        </IconButton>
                    </>
                }
                classes={{ root: classes.cardHeader, action: classes.cardHeaderAction }}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={classes.div}>
                <TableContainer component="div" className={classes.tableContainer}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell data-testid="WeeklyActivityTableCellDateRange">
                                    {`${intlDateFormat(startOfWeek)} - ${intlDateFormat(endOfWeek)}`}
                                </TableCell>
                                <TableCell align="right">{t('Completed')}</TableCell>
                                <TableCell align="right">{t('Appt Produced')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{t('Calls')}</TableCell>
                                <TableCell align="right" data-testid="WeeklyActivityTableCellCompletedCalls">
                                    {loading ? (
                                        <Skeleton variant="text" data-testid="WeeklyActivitySkeletonLoading" />
                                    ) : (
                                        numberFormat(data.completedCalls.totalCount)
                                    )}
                                </TableCell>
                                <TableCell
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
                                <TableCell>{t('Messages')}</TableCell>
                                <TableCell align="right" data-testid="WeeklyActivityTableCellCompletedMessages">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        numberFormat(data.completedMessages.totalCount)
                                    )}
                                </TableCell>
                                <TableCell
                                    align="right"
                                    data-testid="WeeklyActivityTableCellMessagesThatProducedAppointments"
                                >
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        numberFormat(data.messagesThatProducedAppointments.totalCount)
                                    )}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{t('Appointments')}</TableCell>
                                <TableCell align="right" data-testid="WeeklyActivityTableCellCompletedAppointments">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        numberFormat(data.completedAppointments.totalCount)
                                    )}
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>{t('Correspondence')}</TableCell>
                                <TableCell align="right" data-testid="WeeklyActivityTableCellCompletedCorrespondence">
                                    {loading ? (
                                        <Skeleton variant="text" />
                                    ) : (
                                        numberFormat(data.completedCorrespondence.totalCount)
                                    )}
                                </TableCell>
                                <TableCell></TableCell>
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
