import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';
import {
  Box,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart.d';
import { makeStyles } from 'tss-react/mui';
import { BarChartSkeleton } from 'src/components/common/BarChartSkeleton/BarChartSkeleton';
import { LegendReferenceLine } from 'src/components/common/LegendReferenceLine/LegendReferenceLine';
import * as Types from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import illustration15 from '../../../images/drawkit/grape/drawkit-grape-pack-illustration-15.svg';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedBox from '../../AnimatedBox';
import AnimatedCard from '../../AnimatedCard';
import { calculateGraphData } from './graphData';

const useStyles = makeStyles()((theme: Theme) => ({
  cardHeader: {
    textAlign: 'center',
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
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      height: '114px',
    },
  },
}));

export interface DonationHistoriesData {
  accountList: Pick<
    Types.AccountList,
    'currency' | 'monthlyGoal' | 'totalPledges'
  >;
  reportsDonationHistories: Pick<
    Types.DonationHistories,
    'averageIgnoreCurrent'
  > & {
    periods: Array<
      Pick<Types.DonationHistoriesPeriod, 'startDate' | 'convertedTotal'> & {
        totals: Array<Pick<Types.Total, 'currency' | 'convertedAmount'>>;
      }
    >;
  };
  healthIndicatorData: Array<
    Pick<
      Types.HealthIndicatorData,
      'indicationPeriodBegin' | 'staffEnteredGoal'
    >
  >;
}

export interface DonationHistoriesProps {
  loading?: boolean;
  data: DonationHistoriesData | undefined;
  setTime?: (time: DateTime) => void;
}

const DonationHistories = ({
  loading,
  data,
  setTime,
}: DonationHistoriesProps): ReactElement => {
  const { classes } = useStyles();
  const { palette } = useTheme();
  const { push } = useRouter();
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();
  const fills = [
    palette.graphBlue1.main,
    palette.graphBlue2.main,
    palette.graphBlue3.main,
    palette.cruYellow.main,
  ];

  const {
    monthlyGoal: goal,
    totalPledges: pledged,
    currency,
  } = data?.accountList ?? {};

  const {
    periods,
    currencies,
    empty: periodsEmpty,
    domainMax,
  } = calculateGraphData({ locale, data: data, currencyColors: fills });
  const empty = !loading && periodsEmpty;

  const handleClick: CategoricalChartFunc = (period) => {
    if (!period?.activePayload) {
      // The click was inside the chart but wasn't on a period
      return;
    }
    if (setTime) {
      setTime(period.activePayload[0].payload.period);
    } else {
      push({
        pathname: `/accountLists/${accountListId}/reports/donations`,
        query: {
          month: period.activePayload[0].payload.period.toISO(),
        },
      });
    }
  };

  return (
    <div>
      <Box mb={{ xs: 1, sm: 2 }}>
        <AnimatedBox>
          <Typography variant="h6">{t('Monthly Giving')}</Typography>
        </AnimatedBox>
      </Box>
      <AnimatedCard>
        {!empty && (
          <Box display={{ xs: 'none', md: 'block' }}>
            <CardHeader
              className={classes.cardHeader}
              title={
                <Grid container spacing={2} justifyContent="center">
                  <Grid item data-testid="DonationHistoriesTypographyGoal">
                    <LegendReferenceLine
                      name={t('Goal')}
                      value={goal && currencyFormat(goal, currency, locale)}
                      color={palette.graphTeal.main}
                    />
                  </Grid>
                  <Grid item>|</Grid>
                  <Grid item data-testid="DonationHistoriesTypographyAverage">
                    <LegendReferenceLine
                      name={t('Average')}
                      value={
                        loading || !data?.reportsDonationHistories ? (
                          <Skeleton
                            variant="text"
                            style={{ display: 'inline-block' }}
                            width={90}
                          />
                        ) : (
                          currencyFormat(
                            data.reportsDonationHistories.averageIgnoreCurrent,
                            currency,
                            locale,
                          )
                        )
                      }
                      color="#9C9FA1"
                    />
                  </Grid>
                  {pledged ? (
                    <>
                      <Grid item>|</Grid>
                      <Grid
                        item
                        data-testid="DonationHistoriesTypographyPledged"
                      >
                        <LegendReferenceLine
                          name={t('Committed')}
                          value={currencyFormat(pledged, currency, locale)}
                          color={palette.cruYellow.main}
                        />
                      </Grid>
                    </>
                  ) : null}
                </Grid>
              }
            />
          </Box>
        )}
        <CardContent sx={{ overflowX: 'scroll' }}>
          {empty ? (
            <Box
              className={classes.boxImg}
              data-testid="DonationHistoriesBoxEmpty"
            >
              <img
                src={illustration15}
                className={classes.img}
                alt="empty"
                height="248"
              />
              {t('No monthly activity to show.')}
            </Box>
          ) : (
            <>
              <Box display={{ xs: 'none', md: 'block' }} height={250}>
                {loading ? (
                  <BarChartSkeleton bars={12} />
                ) : (
                  <ResponsiveContainer minWidth={600}>
                    <ComposedChart
                      data={periods}
                      margin={{
                        left: 20,
                        right: 20,
                      }}
                      onClick={handleClick}
                    >
                      <Legend />
                      <CartesianGrid vertical={false} />
                      {!data?.healthIndicatorData?.length ? (
                        <ReferenceLine
                          y={goal ?? undefined}
                          stroke={palette.graphTeal.main}
                          strokeWidth={3}
                        />
                      ) : (
                        <Line
                          dataKey="goal"
                          name={t('Goal')}
                          connectNulls
                          stroke={palette.graphTeal.main}
                          strokeWidth={3}
                        />
                      )}
                      <ReferenceLine
                        y={data?.reportsDonationHistories?.averageIgnoreCurrent}
                        stroke={palette.cruGrayMedium.main}
                        strokeWidth={3}
                      />
                      {pledged && (
                        <ReferenceLine
                          y={pledged}
                          stroke={palette.cruYellow.main}
                          strokeWidth={3}
                        />
                      )}
                      <XAxis tickLine={false} dataKey="startDate" />
                      <YAxis
                        domain={[0, domainMax]}
                        label={
                          <Text
                            x={0}
                            y={0}
                            dx={20}
                            dy={150}
                            offset={0}
                            angle={-90}
                          >
                            {t('Amount ({{ currency }})', {
                              currency,
                            })}
                          </Text>
                        }
                      />
                      <Tooltip />
                      {currencies.map((currency) => (
                        <Bar
                          key={currency.name}
                          dataKey={`currencies.${currency.name}`}
                          name={currency.name}
                          stackId="a"
                          fill={currency.fill}
                          barSize={30}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box display={{ xs: 'block', md: 'none' }} height={150}>
                {loading ? (
                  <BarChartSkeleton bars={12} width={10} />
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={periods}>
                      <XAxis tickLine={false} dataKey="startDate" />
                      <Tooltip />
                      <Bar
                        dataKey="total"
                        fill={palette.graphBlue1.main}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default DonationHistories;
