import NextLink from 'next/link';
import React, { ReactElement, useId, useMemo } from 'react';
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
  AccountList,
  ContactFilterPledgeReceivedEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { GoalSource, getHealthIndicatorInfo } from 'src/lib/healthIndicator';
import {
  currencyFormat,
  dateFormat,
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

interface Annotation {
  label: string;
  warning: boolean;
}

export interface MonthlyGoalProps {
  accountListId: string;
  accountList: Pick<
    AccountList,
    | 'currency'
    | 'monthlyGoal'
    | 'monthlyGoalUpdatedAt'
    | 'receivedPledges'
    | 'totalPledges'
  > | null;
  totalGiftsNotStarted?: number;
  onDashboard?: boolean;
}

const MonthlyGoal = ({
  accountListId,
  accountList,
  totalGiftsNotStarted,
  onDashboard = false,
}: MonthlyGoalProps): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const locale = useLocale();

  const loading = accountList === null;
  const {
    receivedPledges: received = 0,
    totalPledges: pledged = 0,
    currency,
  } = accountList ?? {};

  const { data, loading: healthIndicatorLoading } = useHealthIndicatorQuery({
    variables: {
      accountListId,
    },
  });

  const latestHealthIndicatorData = data?.accountList.healthIndicatorData;
  const showHealthIndicator = !!latestHealthIndicatorData;
  const {
    goal,
    goalSource,
    machineCalculatedGoal,
    preferencesGoal,
    preferencesGoalUpdatedAt,
    preferencesGoalLow,
    preferencesGoalOld,
  } = getHealthIndicatorInfo(accountList, latestHealthIndicatorData);
  const goalOrZero = goal ?? 0;
  const hasValidGoal = goal !== null;
  const receivedPercentage = hasValidGoal ? received / goal : NaN;
  const pledgedPercentage = hasValidGoal ? pledged / goal : NaN;
  const belowGoal = goalOrZero - pledged;
  const belowGoalPercentage = hasValidGoal ? belowGoal / goal : NaN;

  const toolTipText = useMemo(() => {
    if (preferencesGoal) {
      return t(
        'Your current goal of {{goal}} is staff-entered, based on the value set in your settings preferences.',
        { goal: currencyFormat(preferencesGoal, currency, locale) },
      );
    } else if (machineCalculatedGoal) {
      return t(
        'Your current goal of {{goal}} is machine-calculated, based on the past year of NetSuite data. You can adjust this goal in your settings preferences.',
        { goal: currencyFormat(machineCalculatedGoal, currency, locale) },
      );
    } else {
      return t(
        'Your current goal is set to "0" because a monthly goal has not been set. You can set your monthly goal in your settings preferences.',
      );
    }
  }, [machineCalculatedGoal, preferencesGoal, currency, locale]);

  const cssProps = {
    containerGrid: showHealthIndicator ? { spacing: 2 } : {},
    monthlyGoalGrid: showHealthIndicator
      ? { xs: 12, md: 6, lg: 7 }
      : { xs: 12 },
    statGrid: showHealthIndicator ? { xs: 6 } : { sm: 6, md: 3 },
    hIGrid: showHealthIndicator ? { xs: 12, md: 6, lg: 5 } : { xs: 0 },
  };

  const annotation: Annotation | null = preferencesGoalLow
    ? {
        label: t('Below machine-calculated goal'),
        warning: true,
      }
    : goalSource === GoalSource.MachineCalculated
    ? {
        label: t('Machine-calculated goal'),
        warning: true,
      }
    : preferencesGoalUpdatedAt
    ? {
        label: t('Last updated {{date}}', {
          date: dateFormat(preferencesGoalUpdatedAt, locale),
        }),
        warning: preferencesGoalOld,
      }
    : null;
  const annotationId = useId();
  const annotationNode = annotation && (
    <Typography
      id={annotationId}
      color={annotation.warning ? 'statusWarning.main' : 'textSecondary'}
      variant="body2"
    >
      <span aria-hidden>*</span>
      {annotation.label}
    </Typography>
  );

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
                  {!loading && currencyFormat(goalOrZero, currency, locale)}
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
                        goalSource === GoalSource.MachineCalculated
                          ? 'statusWarning.main'
                          : undefined
                      }
                    >
                      <Box>
                        <Typography
                          component="div"
                          color="textSecondary"
                          aria-describedby={annotationId}
                        >
                          <div
                            className={[classes.indicator, classes.goal].join(
                              ' ',
                            )}
                          />
                          {t('Goal')}
                        </Typography>
                        <Typography
                          variant="h5"
                          display="flex"
                          data-testid="MonthlyGoalTypographyGoal"
                        >
                          {loading ? (
                            <Skeleton variant="text" />
                          ) : (
                            <>
                              {currencyFormat(goalOrZero, currency, locale)}
                              {annotation && (
                                <Typography
                                  component="span"
                                  color={
                                    annotation.warning
                                      ? 'statusWarning.main'
                                      : 'textSecondary'
                                  }
                                  aria-hidden
                                >
                                  *
                                </Typography>
                              )}
                            </>
                          )}
                        </Typography>
                        {/* Without the HI card there is enough space for the annotation so display it here */}
                        {annotation && !showHealthIndicator && annotationNode}
                        {annotation?.warning && (
                          <Button
                            component={NextLink}
                            href={`/accountLists/${accountListId}/settings/preferences?selectedTab=${PreferenceAccordion.MonthlyGoal}`}
                            variant="outlined"
                            color="warning"
                            sx={(theme) => ({
                              marginTop: theme.spacing(1),
                              textAlign: 'center',
                            })}
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
                      currencyFormat(received, currency, locale)
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
                      currencyFormat(pledged, currency, locale)
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
                        {currencyFormat(belowGoal, currency, locale)}
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
                          currencyFormat(-belowGoal, currency, locale)
                        )}
                      </Typography>
                    </Grid>
                  )}
                </Hidden>
                {/* With the HI card there isn't enough space for the annotation next to the monthly goal so display it here */}
                {annotation && showHealthIndicator && (
                  <Hidden smDown>
                    <Grid item>{annotationNode}</Grid>
                  </Hidden>
                )}
              </Grid>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid {...cssProps.hIGrid} item>
          {latestHealthIndicatorData && (
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
