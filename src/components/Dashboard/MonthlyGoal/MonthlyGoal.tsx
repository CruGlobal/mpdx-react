import NextLink from 'next/link';
import React, { ReactElement, useMemo } from 'react';
import {
  Box,
  Button,
  CardContent,
  Grid,
  Hidden,
  Skeleton,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { HealthIndicatorWidget } from 'src/components/Reports/HealthIndicatorReport/HealthIndicatorWidget/HealthIndicatorWidget';
import { PreferenceAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import {
  ContactFilterPledgeReceivedEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import {
  currencyFormat,
  numberFormat,
  percentageFormat,
} from '../../../lib/intlFormat';
import AnimatedBox from '../../AnimatedBox';
import AnimatedCard from '../../AnimatedCard';
import StyledProgress from '../../StyledProgress';
import { useHealthIndicatorQuery } from './HealthIndicator.generated';

const useStyles = makeStyles()((_theme: Theme) => ({
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

export interface MonthlyGoalProps {
  accountListId: string;
  loading?: boolean;
  goal?: number;
  received?: number;
  pledged?: number;
  totalGiftsNotStarted?: number;
  currencyCode?: string;
  onDashboard?: boolean;
}

const MonthlyGoal = ({
  accountListId,
  loading,
  goal: staffEnteredGoal = 0,
  received = 0,
  pledged = 0,
  totalGiftsNotStarted,
  currencyCode = 'USD',
  onDashboard = false,
}: MonthlyGoalProps): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const locale = useLocale();

  const { data, loading: healthIndicatorLoading } = useHealthIndicatorQuery({
    variables: {
      accountListId,
    },
  });

  const latestHealthIndicatorData = useMemo(
    () => data?.healthIndicatorData.at(-1),
    [data],
  );
  const showHealthIndicator = !!data?.healthIndicatorData.length;
  const machineCalculatedGoal =
    latestHealthIndicatorData?.machineCalculatedGoal ?? null;
  const goal = staffEnteredGoal || machineCalculatedGoal || 0;
  const receivedPercentage = received / goal;
  const pledgedPercentage = pledged / goal;
  const belowGoal = goal - pledged;
  const belowGoalPercentage = belowGoal / goal;

  const toolTipText = useMemo(() => {
    if (staffEnteredGoal) {
      return t(
        'Your current goal of {{goal}} is staff-entered, based on the value set in your settings preferences.',
        { goal: currencyFormat(staffEnteredGoal, currencyCode, locale) },
      );
    } else if (machineCalculatedGoal) {
      return t(
        'Your current goal of {{goal}} is machine-calculated, based on the past year of NetSuite data. You can adjust this goal in your settings preferences.',
        { goal: currencyFormat(machineCalculatedGoal, currencyCode, locale) },
      );
    } else {
      return t(
        'Your current goal is set to "0" because a monthly goal has not been set. You can set your monthly goal in your settings preferences.',
      );
    }
  }, [machineCalculatedGoal, staffEnteredGoal, currencyCode, locale]);

  const cssProps = {
    containerGrid: showHealthIndicator ? { spacing: 2 } : {},
    monthlyGoalGrid: showHealthIndicator
      ? { xs: 12, md: 6, lg: 7 }
      : { xs: 12 },
    statGrid: showHealthIndicator ? { xs: 6 } : { sm: 6, md: 3 },
    hIGrid: showHealthIndicator ? { xs: 12, md: 6, lg: 5 } : { xs: 0 },
  };
  return (
    <>
      <Box my={{ xs: 1, sm: 2 }}>
        <AnimatedBox>
          <Typography variant="h6">
            <Box display="flex">
              <Box flexGrow={1}>{t('Monthly Goal')}</Box>
              <Button
                href={`/accountLists/${accountListId}/contacts/list?filters=${encodeURIComponent(
                  JSON.stringify({
                    pledgeReceived: ContactFilterPledgeReceivedEnum.NotReceived,
                    status: [StatusEnum.PartnerFinancial],
                  }),
                )}`}
              >
                {t('GIFTS NOT STARTED ({{totalGiftsNotStarted}})', {
                  totalGiftsNotStarted: numberFormat(
                    totalGiftsNotStarted ?? 0,
                    locale,
                  ),
                })}
              </Button>
              <Hidden smUp>
                <Box data-testid="MonthlyGoalTypographyGoalMobile">
                  {!loading && currencyFormat(goal, currencyCode, locale)}
                </Box>
              </Hidden>
            </Box>
          </Typography>
        </AnimatedBox>
      </Box>
      <Grid container {...cssProps.containerGrid} data-testid="containerGrid">
        <Grid {...cssProps.monthlyGoalGrid} item>
          <AnimatedCard sx={{ height: '100%' }}>
            <CardContent>
              <StyledProgress
                loading={loading}
                primary={receivedPercentage}
                secondary={pledgedPercentage}
              />
              <Grid container spacing={{ sm: 1, md: 2 }}>
                <Hidden smDown>
                  <Grid {...cssProps.statGrid} item data-testid="goalGrid">
                    <Tooltip
                      title={toolTipText}
                      color={
                        !staffEnteredGoal && machineCalculatedGoal
                          ? 'statusDanger.main'
                          : undefined
                      }
                    >
                      <Box>
                        <Typography component="div" color="textSecondary">
                          <div
                            className={[classes.indicator, classes.goal].join(
                              ' ',
                            )}
                          />
                          {t('Goal')}
                        </Typography>
                        <Typography
                          variant="h5"
                          data-testid="MonthlyGoalTypographyGoal"
                        >
                          {loading ? (
                            <Skeleton variant="text" />
                          ) : (
                            currencyFormat(goal, currencyCode, locale)
                          )}
                        </Typography>
                        {!staffEnteredGoal && (
                          <Button
                            component={NextLink}
                            href={`/accountLists/${accountListId}/settings/preferences?selectedTab=${PreferenceAccordion.MonthlyGoal}`}
                          >
                            {t('Set Monthly Goal')}
                          </Button>
                        )}
                      </Box>
                    </Tooltip>
                  </Grid>
                </Hidden>
                <Grid {...cssProps.statGrid} item>
                  <Typography component="div" color="textSecondary">
                    <div
                      className={[classes.indicator, classes.received].join(
                        ' ',
                      )}
                    />
                    {t('Gifts Started')}
                  </Typography>
                  <Typography
                    variant="h5"
                    data-testid="MonthlyGoalTypographyReceivedPercentage"
                  >
                    {loading ? (
                      <Skeleton variant="text" />
                    ) : isNaN(receivedPercentage) ? (
                      '-'
                    ) : (
                      percentageFormat(receivedPercentage, locale)
                    )}
                  </Typography>
                  <Typography
                    component="small"
                    data-testid="MonthlyGoalTypographyReceived"
                  >
                    {loading ? (
                      <Skeleton variant="text" />
                    ) : (
                      currencyFormat(received, currencyCode, locale)
                    )}
                  </Typography>
                </Grid>
                <Grid {...cssProps.statGrid} item>
                  <Typography component="div" color="textSecondary">
                    <div
                      className={[classes.indicator, classes.pledged].join(' ')}
                    />
                    {t('Commitments')}
                  </Typography>
                  <Typography
                    variant="h5"
                    data-testid="MonthlyGoalTypographyPledgedPercentage"
                  >
                    {loading ? (
                      <Skeleton variant="text" />
                    ) : isNaN(pledgedPercentage) ? (
                      '-'
                    ) : (
                      percentageFormat(pledgedPercentage, locale)
                    )}
                  </Typography>
                  <Typography
                    component="small"
                    data-testid="MonthlyGoalTypographyPledged"
                  >
                    {loading ? (
                      <Skeleton variant="text" />
                    ) : (
                      currencyFormat(pledged, currencyCode, locale)
                    )}
                  </Typography>
                </Grid>
                <Hidden smDown>
                  {!isNaN(belowGoal) && belowGoal > 0 ? (
                    <Grid {...cssProps.statGrid} item>
                      <Typography component="div" color="textSecondary">
                        {t('Below Goal')}
                      </Typography>
                      <Typography
                        variant="h5"
                        data-testid="MonthlyGoalTypographyBelowGoalPercentage"
                      >
                        {percentageFormat(belowGoalPercentage, locale)}
                      </Typography>
                      <Typography
                        component="small"
                        data-testid="MonthlyGoalTypographyBelowGoal"
                      >
                        {currencyFormat(belowGoal, currencyCode, locale)}
                      </Typography>
                    </Grid>
                  ) : (
                    <Grid {...cssProps.statGrid} item>
                      <Typography component="div" color="textSecondary">
                        {t('Above Goal')}
                      </Typography>
                      <Typography
                        variant="h5"
                        data-testid="MonthlyGoalTypographyAboveGoalPercentage"
                      >
                        {loading ? (
                          <Skeleton variant="text" />
                        ) : isNaN(belowGoalPercentage) ? (
                          '-'
                        ) : (
                          percentageFormat(-belowGoalPercentage, locale)
                        )}
                      </Typography>
                      <Typography
                        component="small"
                        data-testid="MonthlyGoalTypographyAboveGoal"
                      >
                        {loading ? (
                          <Skeleton variant="text" />
                        ) : (
                          currencyFormat(-belowGoal, currencyCode, locale)
                        )}
                      </Typography>
                    </Grid>
                  )}
                </Hidden>
              </Grid>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid {...cssProps.hIGrid} item>
          {showHealthIndicator && latestHealthIndicatorData && (
            <HealthIndicatorWidget
              accountListId={accountListId}
              data={latestHealthIndicatorData}
              onDashboard={onDashboard}
              loading={healthIndicatorLoading}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default MonthlyGoal;
