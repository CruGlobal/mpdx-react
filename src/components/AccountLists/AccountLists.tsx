import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import {
  Box,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Link,
  Theme,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { GetAccountListsQuery } from 'pages/GetAccountLists.generated';
import { useLocale } from 'src/hooks/useLocale';
import { GoalSource, getHealthIndicatorInfo } from 'src/lib/healthIndicator';
import {
  currencyFormat,
  dateFormat,
  percentageFormat,
} from 'src/lib/intlFormat';
import AnimatedCard from '../AnimatedCard';
import PageHeading from '../PageHeading';

interface Annotation {
  label: string;
  color?: TypographyProps['color'];
  variant?: TypographyProps['variant'];
}

interface Props {
  data: GetAccountListsQuery;
}

const useStyles = makeStyles()((theme: Theme) => ({
  box: {
    paddingBottom: theme.spacing(5),
    backgroundColor: '#f6f7f9',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '200px',
  },
  image: {
    '& img': {
      height: '160px',
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
}));

const variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const AccountLists = ({ data }: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <Box className={classes.box}>
      <PageHeading heading={t('My Accounts')} overlap={100} />
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        <Container>
          <Grid container spacing={3}>
            {data.accountLists.nodes.map((accountList) => {
              const {
                id,
                name,
                receivedPledges,
                totalPledges,
                currency,
                healthIndicatorData,
              } = accountList;

              const {
                goal,
                goalSource,
                preferencesGoalUpdatedAt,
                preferencesGoalLow,
                preferencesGoalOld,
              } = getHealthIndicatorInfo(accountList, healthIndicatorData);

              const hasValidGoal = goal !== null;
              const receivedPercentage = hasValidGoal
                ? receivedPledges / goal
                : NaN;
              const totalPercentage = hasValidGoal ? totalPledges / goal : NaN;

              const annotation: Annotation | null = preferencesGoalLow
                ? {
                    label: t('Below NetSuite-calculated goal'),
                    color: 'statusWarning.main',
                  }
                : goalSource === GoalSource.MachineCalculated
                ? {
                    label: t('NetSuite-calculated'),
                    color: 'statusWarning.main',
                  }
                : preferencesGoalUpdatedAt
                ? {
                    label: t('Last updated {{date}}', {
                      date: dateFormat(preferencesGoalUpdatedAt, locale),
                    }),
                    color: preferencesGoalOld
                      ? 'statusWarning.main'
                      : undefined,
                  }
                : null;
              const annotationId = `annotation-${id}`;

              return (
                <Grid key={id} item xs={12} sm={4}>
                  <AnimatedCard
                    elevation={3}
                    data-testid={`account-list-${id}`}
                  >
                    <Link
                      component={NextLink}
                      href={`/accountLists/${id}`}
                      underline="none"
                      color="inherit"
                    >
                      <CardActionArea>
                        <CardContent className={classes.cardContent}>
                          <Box flex={1}>
                            <Typography variant="h5" noWrap>
                              {name}
                            </Typography>
                          </Box>
                          <Grid container>
                            {goal && (
                              <Tooltip
                                title={
                                  goalSource === GoalSource.MachineCalculated &&
                                  t(
                                    'Your current goal of {{goal}} is NetSuite-calculated, based on the past year of NetSuite data. You can adjust this goal in your settings preferences.',
                                    {
                                      goal: currencyFormat(
                                        goal,
                                        currency,
                                        locale,
                                      ),
                                    },
                                  )
                                }
                              >
                                <Grid xs={4} item>
                                  <Typography
                                    component="div"
                                    color="textSecondary"
                                  >
                                    {t('Goal')}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    display="flex"
                                    aria-describedby={annotationId}
                                  >
                                    {currencyFormat(goal, currency, locale)}
                                    {annotation && (
                                      <Typography
                                        component="span"
                                        color={annotation.color}
                                        ml={0.25}
                                        aria-hidden
                                      >
                                        *
                                      </Typography>
                                    )}
                                  </Typography>
                                </Grid>
                              </Tooltip>
                            )}
                            <Grid xs={goal ? 4 : 6} item>
                              <Typography component="div" color="textSecondary">
                                {t('Gifts Started')}
                              </Typography>
                              <Typography variant="h6">
                                {Number.isFinite(receivedPercentage)
                                  ? percentageFormat(receivedPercentage, locale)
                                  : '-'}
                              </Typography>
                            </Grid>
                            <Grid xs={goal ? 4 : 6} item>
                              <Typography component="div" color="textSecondary">
                                {t('Committed')}
                              </Typography>
                              <Typography variant="h6">
                                {Number.isFinite(totalPercentage)
                                  ? percentageFormat(totalPercentage, locale)
                                  : '-'}
                              </Typography>
                            </Grid>
                          </Grid>
                          {annotation && (
                            <Typography
                              id={annotationId}
                              component="div"
                              color={annotation.color}
                              variant="body2"
                            >
                              <span aria-hidden>*</span>
                              {annotation.label}
                            </Typography>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Link>
                  </AnimatedCard>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </motion.div>
    </Box>
  );
};

export default AccountLists;
