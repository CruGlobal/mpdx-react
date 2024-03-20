import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Skeleton,
  Theme,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import illustration13 from '../../../../images/drawkit/grape/drawkit-grape-pack-illustration-13.svg';
import { currencyFormat, percentageFormat } from '../../../../lib/intlFormat';
import AnimatedCard from '../../../AnimatedCard';
import HandoffLink from '../../../HandoffLink';
import StyledProgress from '../../../StyledProgress';
import { GetThisWeekQuery } from '../GetThisWeek.generated';

const useStyles = makeStyles()((theme: Theme) => ({
  div: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  list: {
    flex: 1,
    padding: 0,
    overflow: 'auto',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '322px',
    [theme.breakpoints.down('xs')]: {
      height: 'auto',
    },
  },
  cardContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  cardContentExpanded: {
    padding: theme.spacing(0, 2),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  img: {
    height: '150px',
    marginBottom: theme.spacing(2),
  },
  pledgesAmountProcessed: {
    background: 'linear-gradient(180deg, #FFE67C 0%, #FFCF07 100%)',
  },
  pledgesAmountTotal: {
    border: '5px solid #FFCF07',
  },
  indicator: {
    display: 'inline-block',
    borderRadius: '18px',
    width: '18px',
    height: '18px',
    marginRight: '5px',
    marginBottom: '-3px',
  },
  titleContainer: {
    width: '100%',
  },
  title: {
    display: 'flex',
    marginBottom: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  titleContent: {
    flexGrow: 1,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  appealsHeader: {
    textTransform: 'capitalize',
    width: '100%',
  },
}));

interface Props {
  loading?: boolean;
  appeal?: GetThisWeekQuery['accountList']['primaryAppeal'];
}

const Appeals = ({ loading, appeal }: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const pledgesAmountProcessedPercentage =
    (appeal?.pledgesAmountProcessed || 0) / (appeal?.amount || 0);
  const pledgesAmountTotalPercentage =
    (appeal?.pledgesAmountTotal || 0) / (appeal?.amount || 0);

  return (
    <AnimatedCard className={classes.card}>
      <CardHeader title={t('Appeals')} />
      {!loading && !appeal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
        >
          <CardContent
            className={classes.cardContent}
            data-testid="AppealsCardContentEmpty"
          >
            <img src={illustration13} className={classes.img} alt="empty" />
            {t('No primary appeal to show.')}
          </CardContent>
        </motion.div>
      )}
      {(loading || appeal) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.div}
        >
          <CardContent
            className={[classes.cardContent, classes.cardContentExpanded].join(
              ' ',
            )}
          >
            <HandoffLink path={`/tools/appeals/${appeal?.id}`}>
              <Link underline="hover" className={classes.appealsHeader}>
                <Typography variant="h6" className={classes.titleContainer}>
                  <Box className={classes.title}>
                    <Box
                      className={classes.titleContent}
                      data-testid="AppealsBoxName"
                    >
                      {loading ? (
                        <Skeleton variant="text" width="50%" />
                      ) : (
                        appeal?.name
                      )}
                    </Box>
                    <Box data-testid="AppealsBoxAmount">
                      {loading && <Skeleton variant="text" width={100} />}
                      {!loading &&
                        appeal?.amount &&
                        currencyFormat(
                          appeal.amount,
                          appeal?.amountCurrency,
                          locale,
                        )}
                    </Box>
                  </Box>
                </Typography>
              </Link>
            </HandoffLink>
            <StyledProgress
              loading={loading}
              primary={pledgesAmountProcessedPercentage}
              secondary={pledgesAmountTotalPercentage}
            />
            <Grid container spacing={2}>
              <Grid xs={6} item>
                <Typography component="div" color="textSecondary">
                  <div
                    className={[
                      classes.indicator,
                      classes.pledgesAmountProcessed,
                    ].join(' ')}
                  />
                  {t('Gifts Received')}
                </Typography>
                <Typography
                  variant="h5"
                  data-testid="AppealsTypographyPledgesAmountProcessedPercentage"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    percentageFormat(pledgesAmountProcessedPercentage, locale)
                  )}
                </Typography>
                <Typography
                  component="small"
                  data-testid="AppealsTypographyPledgesAmountProcessed"
                >
                  {loading || !appeal ? (
                    <Skeleton variant="text" />
                  ) : (
                    currencyFormat(
                      appeal.pledgesAmountProcessed,
                      appeal.amountCurrency,
                      locale,
                    )
                  )}
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <Typography component="div" color="textSecondary">
                  <div
                    className={[
                      classes.indicator,
                      classes.pledgesAmountTotal,
                    ].join(' ')}
                  />
                  {t('Commitments')}
                </Typography>
                <Typography
                  variant="h5"
                  data-testid="AppealsTypographyPledgesAmountTotalPercentage"
                >
                  {loading ? (
                    <Skeleton variant="text" />
                  ) : (
                    percentageFormat(pledgesAmountTotalPercentage, locale)
                  )}
                </Typography>
                <Typography
                  component="small"
                  data-testid="AppealsTypographyPledgesAmountTotal"
                >
                  {loading || !appeal ? (
                    <Skeleton variant="text" />
                  ) : (
                    currencyFormat(
                      appeal.pledgesAmountTotal,
                      appeal.amountCurrency,
                      locale,
                    )
                  )}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <HandoffLink path="/tools/appeals">
              <Button size="small" color="primary">
                {t('View All')}
              </Button>
            </HandoffLink>
          </CardActions>
        </motion.div>
      )}
    </AnimatedCard>
  );
};

export default Appeals;
