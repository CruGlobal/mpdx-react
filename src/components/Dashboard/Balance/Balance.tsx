import React, { ReactElement } from 'react';
import {
  Theme,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Skeleton } from '@mui/lab';
import { useTranslation } from 'react-i18next';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';
import HandoffLink from '../../HandoffLink';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 65px)',
    },
  },
  cardContent: {
    flex: '1',
  },
}));

interface Props {
  loading?: boolean;
  balance?: number;
  currencyCode?: string;
}

const Balance = ({
  loading,
  balance,
  currencyCode = 'USD',
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      <Box my={{ xs: 1, sm: 2 }}>
        <AnimatedBox>
          <Typography variant="h6">{t('Account Balance')}</Typography>
        </AnimatedBox>
      </Box>
      <AnimatedCard className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="h5" data-testid="BalanceTypography">
            {loading || balance === undefined ? (
              <Skeleton variant="text" />
            ) : (
              currencyFormat(balance, currencyCode)
            )}
          </Typography>
          <Typography>{t('It may take a few days to update.')}</Typography>
        </CardContent>
        <CardActions>
          <HandoffLink path="/reports/donations">
            <Button size="small" color="primary">
              {t('View Gifts')}
            </Button>
          </HandoffLink>
        </CardActions>
      </AnimatedCard>
    </>
  );
};

export default Balance;
