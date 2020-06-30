import React, { ReactElement } from 'react';
import { Typography, makeStyles, Theme, Grid, Card, CardContent, Box } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { currencyFormat, percentageFormat } from '../../../lib/intlFormat';

const useStyles = makeStyles((theme: Theme) => ({
    progress: {
        width: '100%',
        height: '54px',
        border: '2px solid #999999',
        borderRadius: '50px',
        padding: '2px',
        position: 'relative',
        marginBottom: theme.spacing(2),
    },
    progressBar: {
        position: 'absolute',
        left: '2px',
        height: '46px',
        minWidth: '46px',
        maxWidth: '99.6%',
        borderRadius: '46px',
        transition: 'width 0.5s ease-in-out',
        width: '0%',
    },
    progressBarSkeleton: {
        borderRadius: '46px',
        height: '46px',
        transform: 'none',
    },
    received: {
        background: 'linear-gradient(180deg, #FFE67C 0%, #FFCF07 100%)',
    },
    pledged: {
        border: '5px solid #FFCF07',
    },
    goal: {
        border: '2px solid #999999',
    },
    indicator: {
        display: 'inline-block',
        borderRadius: '18px',
        width: '18px',
        height: '18px',
        marginRight: '5px',
        marginBottom: '-3px',
    },
}));

interface Props {
    loading?: boolean;
    goal?: number;
    received?: number;
    pledged?: number;
    currencyCode?: string;
}

const MonthlyGoal = ({ loading, goal, received, pledged, currencyCode = 'USD' }: Props): ReactElement => {
    const classes = useStyles();
    const receivedPercentage = received / goal;
    const pledgedPercentage = pledged / goal;
    const belowGoal = goal - pledged;
    const belowGoalPercentage = belowGoal / goal;

    return (
        <>
            <Box my={{ xs: 1, sm: 2 }}>
                <Typography variant="h6">Monthly Goal</Typography>
            </Box>
            <Card>
                <CardContent>
                    <div className={classes.progress}>
                        {loading ? (
                            <Skeleton className={classes.progressBarSkeleton} animation="wave" />
                        ) : (
                            <>
                                <div
                                    style={{ width: percentageFormat(pledgedPercentage) }}
                                    className={[classes.progressBar, classes.pledged].join(' ')}
                                />
                                {receivedPercentage > 0 && (
                                    <div
                                        style={{ width: percentageFormat(receivedPercentage) }}
                                        className={[classes.progressBar, classes.received].join(' ')}
                                    />
                                )}
                            </>
                        )}
                    </div>
                    <Grid container spacing={2}>
                        <Grid xs={6} md={3} item>
                            <Typography component="div" color="textSecondary">
                                <div className={[classes.indicator, classes.goal].join(' ')} />
                                Goal
                            </Typography>
                            <Typography variant="h5">
                                {loading ? <Skeleton variant="text" /> : currencyFormat(goal, currencyCode)}
                            </Typography>
                        </Grid>
                        <Grid xs={6} md={3} item>
                            <Typography component="div" color="textSecondary">
                                <div className={[classes.indicator, classes.received].join(' ')} />
                                Gifts Started
                            </Typography>
                            <Typography variant="h5">
                                {loading ? (
                                    <Skeleton variant="text" />
                                ) : isNaN(receivedPercentage) ? (
                                    '- '
                                ) : (
                                    percentageFormat(receivedPercentage)
                                )}
                            </Typography>
                            <Typography component="small">
                                {loading ? <Skeleton variant="text" /> : currencyFormat(received, currencyCode)}
                            </Typography>
                        </Grid>
                        <Grid xs={6} md={3} item>
                            <Typography component="div" color="textSecondary">
                                <div className={[classes.indicator, classes.pledged].join(' ')} />
                                Commitments
                            </Typography>
                            <Typography variant="h5">
                                {loading ? (
                                    <Skeleton variant="text" />
                                ) : isNaN(pledgedPercentage) ? (
                                    '- '
                                ) : (
                                    percentageFormat(pledgedPercentage)
                                )}
                            </Typography>
                            <Typography component="small">
                                {loading ? <Skeleton variant="text" /> : currencyFormat(pledged, currencyCode)}
                            </Typography>
                        </Grid>
                        <Grid xs={6} md={3} item>
                            <Typography component="div" color="textSecondary">
                                Below Goal
                            </Typography>
                            <Typography variant="h5">
                                {loading ? (
                                    <Skeleton variant="text" />
                                ) : isNaN(belowGoalPercentage) ? (
                                    '- '
                                ) : (
                                    percentageFormat(belowGoalPercentage)
                                )}
                            </Typography>
                            <Typography component="small">
                                {loading ? <Skeleton variant="text" /> : currencyFormat(belowGoal, currencyCode)}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    );
};

export default MonthlyGoal;
