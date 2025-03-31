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
  CartesianGrid,
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
import {
  StyledBarChart,
  StyledComposedChart,
} from 'src/components/common/StyledBarChart/StyledBarChart';
import * as Types from 'src/graphql/types.generated';
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
      | 'indicationPeriodBegin'
      | 'machineCalculatedGoal'
      | 'machineCalculatedGoalCurrency'
      | 'staffEnteredGoal'
    >
  >;
}

export interface DonationHistoriesProps {
  loading?: boolean;
  data: DonationHistoriesData | undefined;
  onPeriodClick?: (period: DateTime) => void;
}

const DonationHistories = ({
  loading,
  data,
  onPeriodClick,
}: DonationHistoriesProps): ReactElement => {
  const { classes } = useStyles();
  const { palette } = useTheme();
  const { t } = useTranslation();
  const locale = useLocale();
  const fills = [
    palette.cyan.main,
    palette.pink.main,
    palette.green.main,
    palette.yellow.main,
  ];
  const goalColor = palette.orange.main;
  const averageColor = palette.graphite.main;
  const pledgedColor = palette.yellow.main;

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

  const handleClick: CategoricalChartFunc = (state) => {
    if (!state?.activePayload) {
      // The click was inside the chart but wasn't on a period
      return;
    }

    onPeriodClick?.(state.activePayload[0].payload.period);
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
                      color={goalColor}
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
                      color={averageColor}
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
                          color={pledgedColor}
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
              <Box display={{ xs: 'none', md: 'block' }}>
                {loading ? (
                  <BarChartSkeleton bars={12} />
                ) : (
                  <ResponsiveContainer height={250}>
                    <StyledComposedChart
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
                          stroke={goalColor}
                          strokeWidth={3}
                        />
                      ) : (
                        <Line
                          dataKey="goal"
                          name={t('Goal')}
                          connectNulls
                          dot={false}
                          stroke={goalColor}
                          strokeWidth={3}
                        />
                      )}
                      <ReferenceLine
                        y={data?.reportsDonationHistories?.averageIgnoreCurrent}
                        stroke={averageColor}
                        strokeWidth={3}
                      />
                      {pledged && (
                        <ReferenceLine
                          y={pledged}
                          stroke={pledgedColor}
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
                    </StyledComposedChart>
                  </ResponsiveContainer>
                )}
              </Box>
              <Box display={{ xs: 'block', md: 'none' }}>
                {loading ? (
                  <BarChartSkeleton bars={12} width={10} />
                ) : (
                  <ResponsiveContainer height={150}>
                    <StyledBarChart data={periods}>
                      <XAxis tickLine={false} dataKey="startDate" />
                      <Tooltip />
                      <Bar dataKey="total" fill={fills[0]} barSize={10} />
                    </StyledBarChart>
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
