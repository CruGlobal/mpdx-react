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
import moment from 'moment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Skeleton } from '@material-ui/lab';
import AnimatedCard from '../../../AnimatedCard';
import { GetWeeklyActivityQuery } from '../../../../../types/GetWeeklyActivityQuery';
import { dayMonthFormat, numberFormat } from '../../../../lib/intlFormat';

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

    const [startOfWeek, setStartOfWeek] = useState(moment().startOf('week').toISOString());
    const [endOfWeek, setEndOfWeek] = useState(moment().endOf('week').toISOString());

    const { data, loading, refetch } = useQuery<GetWeeklyActivityQuery>(GET_WEEKLY_ACTIVITY_QUERY, {
        variables: {
            accountListId,
            startOfWeek,
            endOfWeek,
        },
    });

    const addWeek = (): void => {
        setStartOfWeek((startOfWeek) => moment(startOfWeek).add(1, 'week').toISOString());
        setEndOfWeek((endOfWeek) => moment(endOfWeek).add(1, 'week').toISOString());
    };

    const subtractWeek = (): void => {
        setStartOfWeek((startOfWeek) => moment(startOfWeek).subtract(1, 'week').toISOString());
        setEndOfWeek((endOfWeek) => moment(endOfWeek).subtract(1, 'week').toISOString());
    };

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
                title="Weekly Activity"
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
                                    {dayMonthFormat(moment(startOfWeek).date(), moment(startOfWeek).month())} -{' '}
                                    {dayMonthFormat(moment(endOfWeek).date(), moment(endOfWeek).month())}
                                </TableCell>
                                <TableCell align="right">Completed</TableCell>
                                <TableCell align="right">Appt Produced</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>Calls</TableCell>
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
                                <TableCell>Messages</TableCell>
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
                                <TableCell>Appointments</TableCell>
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
                                <TableCell>Correspondence</TableCell>
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
                    <Button size="small" color="primary">
                        View Activity Detail
                    </Button>
                </CardActions>
            </motion.div>
        </AnimatedCard>
    );
};

export default WeeklyActivity;
