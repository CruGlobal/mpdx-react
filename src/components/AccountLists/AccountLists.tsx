import Link from 'next/link';
import React, { ReactElement } from 'react';
import {
  Box,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Theme,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { GetAccountListsQuery } from 'pages/GetAccountLists.generated';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from '../../lib/intlFormat';
import AnimatedCard from '../AnimatedCard';
import PageHeading from '../PageHeading';

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
            {data.accountLists.nodes.map(
              ({
                id,
                name,
                monthlyGoal,
                receivedPledges,
                totalPledges,
                currency,
              }) => {
                const receivedPercentage =
                  receivedPledges / (monthlyGoal ?? NaN);
                const totalPercentage = totalPledges / (monthlyGoal ?? NaN);

                return (
                  <Grid key={id} item xs={12} sm={4}>
                    <AnimatedCard elevation={3}>
                      <Link href={`/accountLists/${id}`} passHref>
                        <CardActionArea>
                          <CardContent className={classes.cardContent}>
                            <Box flex={1}>
                              <Typography variant="h5" data-testid={id} noWrap>
                                {name}
                              </Typography>
                            </Box>
                            <Grid container>
                              {monthlyGoal && (
                                <Grid xs={4} item>
                                  <Typography
                                    component="div"
                                    color="textSecondary"
                                  >
                                    {t('Goal')}
                                  </Typography>
                                  <Typography variant="h6">
                                    {currencyFormat(
                                      monthlyGoal,
                                      currency,
                                      locale,
                                    )}
                                  </Typography>
                                </Grid>
                              )}
                              <Grid xs={monthlyGoal ? 4 : 6} item>
                                <Typography
                                  component="div"
                                  color="textSecondary"
                                >
                                  {t('Gifts Started')}
                                </Typography>
                                <Typography variant="h6">
                                  {Number.isFinite(receivedPercentage)
                                    ? percentageFormat(
                                        receivedPercentage,
                                        locale,
                                      )
                                    : '-'}
                                </Typography>
                              </Grid>
                              <Grid xs={monthlyGoal ? 4 : 6} item>
                                <Typography
                                  component="div"
                                  color="textSecondary"
                                >
                                  {t('Committed')}
                                </Typography>
                                <Typography variant="h6">
                                  {Number.isFinite(totalPercentage)
                                    ? percentageFormat(totalPercentage, locale)
                                    : '-'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </CardActionArea>
                      </Link>
                    </AnimatedCard>
                  </Grid>
                );
              },
            )}
          </Grid>
        </Container>
      </motion.div>
    </Box>
  );
};

export default AccountLists;
