import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Skeleton,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from '../../../lib/intlFormat';
import AnimatedBox from '../../AnimatedBox';
import AnimatedCard from '../../AnimatedCard';

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
