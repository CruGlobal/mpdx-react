import React, { ReactElement } from 'react';
import {
  Theme,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import NextLink from 'next/link';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedCard from '../../AnimatedCard';
import AnimatedBox from '../../AnimatedBox';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';

const useStyles = makeStyles()((theme: Theme) => ({
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
  const { classes } = useStyles();
  const { t } = useTranslation();
  const locale = useLocale();
  const accountListId = useAccountListId();

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
              currencyFormat(balance, currencyCode, locale)
            )}
          </Typography>
          <Typography>{t('It may take a few days to update.')}</Typography>
        </CardContent>
        <CardActions>
          <NextLink href={`/accountLists/${accountListId}/reports/donations`}>
            <Button size="small" color="primary">
              {t('View Gifts')}
            </Button>
          </NextLink>
        </CardActions>
      </AnimatedCard>
    </>
  );
};

export default Balance;
