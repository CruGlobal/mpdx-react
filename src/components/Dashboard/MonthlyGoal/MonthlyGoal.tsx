import React, { ReactElement } from 'react';
import {
  Typography,
  makeStyles,
  Theme,
  Grid,
  CardContent,
  Box,
  Hidden,
  Button,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { currencyFormat, percentageFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';
import StyledProgress from '../../StyledProgress';

const useStyles = makeStyles((_theme: Theme) => ({
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

const MonthlyGoal = ({
  loading,
  goal,
  received,
  pledged,
  currencyCode = 'USD',
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
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
              <Button>{t('GIFTS NOT STARTED (0)')}</Button>
              <Hidden smUp>
                <Box data-testid="MonthlyGoalTypographyGoalMobile">
                  {!loading && currencyFormat(goal, currencyCode)}
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
            <Hidden xsDown>
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
                    currencyFormat(goal, currencyCode)
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
                  percentageFormat(receivedPercentage)
                )}
              </Typography>
              <Typography
                component="small"
                data-testid="MonthlyGoalTypographyReceived"
              >
                {loading ? (
                  <Skeleton variant="text" />
                ) : (
                  currencyFormat(received, currencyCode)
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
                  percentageFormat(pledgedPercentage)
                )}
              </Typography>
              <Typography
                component="small"
                data-testid="MonthlyGoalTypographyPledged"
              >
                {loading ? (
                  <Skeleton variant="text" />
                ) : (
                  currencyFormat(pledged, currencyCode)
                )}
              </Typography>
            </Grid>
            <Hidden xsDown>
              {!isNaN(belowGoal) && belowGoal > 0 ? (
                <Grid sm={6} md={3} item>
                  <Typography component="div" color="textSecondary">
                    {t('Below Goal')}
                  </Typography>
                  <Typography
                    variant="h5"
                    data-testid="MonthlyGoalTypographyBelowGoalPercentage"
                  >
                    {percentageFormat(belowGoalPercentage)}
                  </Typography>
                  <Typography
                    component="small"
                    data-testid="MonthlyGoalTypographyBelowGoal"
                  >
                    {currencyFormat(belowGoal, currencyCode)}
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
                      percentageFormat(-belowGoalPercentage)
                    )}
                  </Typography>
                  <Typography
                    component="small"
                    data-testid="MonthlyGoalTypographyAboveGoal"
                  >
                    {loading ? (
                      <Skeleton variant="text" />
                    ) : (
                      currencyFormat(-belowGoal, currencyCode)
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
