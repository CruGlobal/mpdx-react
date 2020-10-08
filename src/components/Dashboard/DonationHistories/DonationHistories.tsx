import React, { ReactElement } from 'react';
import { CardContent, Box, Typography, Grid, CardHeader, makeStyles, Theme } from '@material-ui/core';
import {
    ReferenceLine,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Text,
} from 'recharts';
import moment from 'moment';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';

const useStyles = makeStyles((theme: Theme) => ({
    cardHeader: {
        textAlign: 'center',
    },
    lineKey: {
        display: 'inline-block',
        height: '5px',
        width: '20px',
        marginRight: '10px',
        marginBottom: '4px',
        borderRadius: '5px',
    },
    lineKeyGoal: {
        backgroundColor: '#17AEBF',
    },
    lineKeyAverage: {
        backgroundColor: '#9C9FA1',
    },
    lineKeyPledged: {
        backgroundColor: '#FFCF07',
    },
    boxImg: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            padding: theme.spacing(0),
        },
    },
    img: {
        height: '248px',
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('xs')]: {
            height: '114px',
        },
    },
}));

interface Props {
    loading?: boolean;
    reportsDonationHistories?: {
        periods: {
            convertedTotal: number;
            startDate: string;
            totals: { currency: string; convertedAmount: number }[];
        }[];
        averageIgnoreCurrent: number;
    };
    currencyCode?: string;
    goal?: number;
    pledged?: number;
}

const DonationHistories = ({
    loading,
    reportsDonationHistories,
    goal,
    pledged,
    currencyCode = 'USD',
}: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const fills = ['#FFCF07', '#30F2F2', '#1FC0D2', '#007398'];
    const currencies: { dataKey: string; fill: string }[] = [];
    const periods = reportsDonationHistories?.periods?.map((period) => {
        const data = { startDate: moment(period.startDate).format('MMM YY'), total: period.convertedTotal };
        period.totals.forEach((total) => {
            if (!currencies.find((currency) => total.currency == currency.dataKey)) {
                currencies.push({ dataKey: total.currency, fill: fills.pop() });
            }
            data[total.currency] = total.convertedAmount;
        });
        return data;
    });
    const empty = !loading && (periods === undefined || periods.reduce((result, { total }) => result + total, 0) === 0);

    return (
        <>
            <Box my={{ xs: 1, sm: 2 }}>
                <AnimatedBox>
                    <Typography variant="h6">Monthly Activity</Typography>
                </AnimatedBox>
            </Box>
            <AnimatedCard>
                {!empty && (
                    <Box display={{ xs: 'none', sm: 'block' }}>
                        <CardHeader
                            className={classes.cardHeader}
                            title={
                                <Box display={{ xs: 'none', sm: 'block' }}>
                                    <Grid container spacing={2} justify="center">
                                        {goal ? (
                                            <>
                                                <Grid item>
                                                    <Box className={[classes.lineKey, classes.lineKeyGoal].join(' ')} />
                                                    <Typography
                                                        variant="body1"
                                                        component="span"
                                                        data-testid="DonationHistoriesTypographyGoal"
                                                    >
                                                        <strong>{t('Goal')}</strong>{' '}
                                                        {currencyFormat(goal, currencyCode)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item>|</Grid>
                                            </>
                                        ) : null}
                                        <Grid item>
                                            <Box className={[classes.lineKey, classes.lineKeyAverage].join(' ')} />
                                            <Typography
                                                variant="body1"
                                                component="span"
                                                data-testid="DonationHistoriesTypographyAverage"
                                            >
                                                <strong>{t('Average')}</strong>{' '}
                                                {loading ? (
                                                    <Skeleton
                                                        variant="text"
                                                        style={{ display: 'inline-block' }}
                                                        width={90}
                                                    />
                                                ) : (
                                                    currencyFormat(
                                                        reportsDonationHistories.averageIgnoreCurrent,
                                                        currencyCode,
                                                    )
                                                )}
                                            </Typography>
                                        </Grid>
                                        {pledged ? (
                                            <>
                                                <Grid item>|</Grid>
                                                <Grid item>
                                                    <Box
                                                        className={[classes.lineKey, classes.lineKeyPledged].join(' ')}
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        component="span"
                                                        data-testid="DonationHistoriesTypographyPledged"
                                                    >
                                                        <strong>{t('Committed')}</strong>{' '}
                                                        {currencyFormat(pledged, currencyCode)}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        ) : null}
                                    </Grid>
                                </Box>
                            }
                        />
                    </Box>
                )}
                <CardContent>
                    {empty ? (
                        <Box className={classes.boxImg} data-testid="DonationHistoriesBoxEmpty">
                            <img
                                src={require('../../../images/drawkit/grape/drawkit-grape-pack-illustration-15.svg')}
                                className={classes.img}
                                alt="empty"
                            />
                            {t('No monthly activity to show.')}
                        </Box>
                    ) : (
                        <>
                            <Box display={{ xs: 'none', sm: 'block' }} style={{ height: '250px' }}>
                                {loading ? (
                                    <Grid
                                        container
                                        justify="space-between"
                                        alignItems="flex-end"
                                        data-testid="DonationHistoriesGridLoading"
                                    >
                                        <Skeleton variant="rect" width={30} height={30} />
                                        <Skeleton variant="rect" width={30} height={50} />
                                        <Skeleton variant="rect" width={30} height={70} />
                                        <Skeleton variant="rect" width={30} height={90} />
                                        <Skeleton variant="rect" width={30} height={110} />
                                        <Skeleton variant="rect" width={30} height={130} />
                                        <Skeleton variant="rect" width={30} height={150} />
                                        <Skeleton variant="rect" width={30} height={170} />
                                        <Skeleton variant="rect" width={30} height={190} />
                                        <Skeleton variant="rect" width={30} height={210} />
                                        <Skeleton variant="rect" width={30} height={230} />
                                        <Skeleton variant="rect" width={30} height={250} />
                                    </Grid>
                                ) : (
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={periods}
                                            margin={{
                                                left: 20,
                                                right: 20,
                                            }}
                                        >
                                            <Legend />
                                            <CartesianGrid vertical={false} />
                                            {goal && <ReferenceLine y={goal} stroke="#17AEBF" strokeWidth={3} />}
                                            <ReferenceLine
                                                y={reportsDonationHistories?.averageIgnoreCurrent}
                                                stroke="#9C9FA1"
                                                strokeWidth={3}
                                            />
                                            {pledged && <ReferenceLine y={pledged} stroke="#FFCF07" strokeWidth={3} />}
                                            <XAxis tickLine={false} dataKey="startDate" />
                                            <YAxis
                                                label={
                                                    <Text x={0} y={0} dx={20} dy={150} offset={0} angle={-90}>
                                                        {t('Amount ({{ currencyCode }})', { currencyCode })}
                                                    </Text>
                                                }
                                            />
                                            <Tooltip />
                                            {currencies.map((currency) => (
                                                <Bar
                                                    key={currency.dataKey}
                                                    dataKey={currency.dataKey}
                                                    stackId="a"
                                                    fill={currency.fill}
                                                    barSize={30}
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                            <Box display={{ xs: 'block', sm: 'none' }} style={{ height: '150px' }}>
                                {loading ? (
                                    <Grid container justify="space-between" alignItems="flex-end">
                                        <Skeleton variant="rect" width={10} height={40} />
                                        <Skeleton variant="rect" width={10} height={50} />
                                        <Skeleton variant="rect" width={10} height={60} />
                                        <Skeleton variant="rect" width={10} height={70} />
                                        <Skeleton variant="rect" width={10} height={80} />
                                        <Skeleton variant="rect" width={10} height={90} />
                                        <Skeleton variant="rect" width={10} height={100} />
                                        <Skeleton variant="rect" width={10} height={110} />
                                        <Skeleton variant="rect" width={10} height={120} />
                                        <Skeleton variant="rect" width={10} height={130} />
                                        <Skeleton variant="rect" width={10} height={140} />
                                        <Skeleton variant="rect" width={10} height={150} />
                                    </Grid>
                                ) : (
                                    <ResponsiveContainer>
                                        <BarChart data={periods}>
                                            <XAxis tickLine={false} dataKey="startDate" />
                                            <Tooltip />
                                            <Bar dataKey="total" fill="#007398" barSize={10} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </Box>
                        </>
                    )}
                </CardContent>
            </AnimatedCard>
        </>
    );
};

export default DonationHistories;
