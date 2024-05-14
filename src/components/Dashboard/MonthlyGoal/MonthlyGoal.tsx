import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  CardContent,
  Grid,
  Hidden,
  Skeleton,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
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

interface Props {
  accountListId: string;
  loading?: boolean;
  goal?: number;
  received?: number;
  pledged?: number;
  totalGiftsNotStarted?: number;
  currencyCode?: string;
}

const MonthlyGoal = ({
  accountListId,
  loading,
  goal = 0,
  received = 0,
  pledged = 0,
  totalGiftsNotStarted,
  currencyCode = 'USD',
}: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const receivedPercentage = received / goal;
  const pledgedPercentage = pledged / goal;
  const belowGoal = goal - pledged;
  const belowGoalPercentage = belowGoal / goal;

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
      <AnimatedCard>
        <CardContent>
          <StyledProgress
            loading={loading}
            primary={receivedPercentage}
            secondary={pledgedPercentage}
          />
          <Grid container spacing={2}>
            <Hidden smDown>
              <Grid sm={6} md={3} item>
                <Typography component="div" color="textSecondary">
                  <div
                    className={[classes.indicator, classes.goal].join(' ')}
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
              </Grid>
            </Hidden>
            <Grid xs={6} md={3} item>
              <Typography component="div" color="textSecondary">
                <div
                  className={[classes.indicator, classes.received].join(' ')}
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
            <Grid xs={6} md={3} item>
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
                <Grid sm={6} md={3} item>
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
                <Grid sm={6} md={3} item>
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
    </>
  );
};

export default MonthlyGoal;
