import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Box, CardContent, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { AppealFieldsFragment } from 'pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import { useAccountListId } from '../../../../hooks/useAccountListId';
import theme from '../../../../theme';
import AnimatedCard from '../../../AnimatedCard';
import AppealProgressBar from '../AppealDetails/AppealProgressBar/AppealProgressBar';

const useStyles = makeStyles()(() => ({
  cardContent: {
    marginTop: -theme.spacing(2),
  },
  starPrimary: {
    transform: `translateY(${theme.spacing(0.5)}px)`,
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.mpdxBlue.main,
    },
  },
  colorYellow: {
    color: theme.palette.progressBarYellow.main,
  },
  colorOrange: {
    color: theme.palette.progressBarOrange.main,
  },
  colorLightGray: {
    color: theme.palette.progressBarGray.main,
  },
  progressBarOuter: {
    backgroundColor: theme.palette.mpdxGrayDark.main,
    width: '100%',
    height: '30px',
    borderRadius: 10,
    padding: 3,
  },
  progressBarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflowX: 'hidden',
  },
  nameLink: {
    '& a': {
      textDecoration: 'none',
      color: theme.palette.mpdxBlue.main,
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  hoverHighlight: {
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.mpdxBlue.main,
    },
  },
  primaryButton: {
    marginTop: '-6px',
    marginLeft: theme.spacing(1),
  },
}));

export interface AppealProps {
  appeal: AppealFieldsFragment;
  primary?: boolean;
  changePrimary: (newPrimaryId: string) => void;
}

const Appeal = ({
  appeal,
  primary = false,
  changePrimary,
}: AppealProps): ReactElement => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  const {
    name,
    id,
    amount: appealAmount,
    amountCurrency,
    pledgesAmountProcessed,
    pledgesAmountReceivedNotProcessed,
    pledgesAmountNotReceivedNotProcessed,
  } = appeal;
  const amount = appealAmount || 0;
  const given = pledgesAmountProcessed || 0;
  const received = pledgesAmountReceivedNotProcessed || 0;
  const committed = pledgesAmountNotReceivedNotProcessed || 0;

  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent className={classes.cardContent}>
          <Box display="flex" justifyContent="space-between">
            <Typography
              variant="h6"
              display="inline"
              className={classes.nameLink}
            >
              <NextLink
                href={`/accountLists/${accountListId}/tools/appeals/appeal/${id}`}
                scroll={false}
              >
                {name}
              </NextLink>
            </Typography>
            <Box>
              <Typography variant="h6" display="inline">
                {given.toFixed(2)} / {amount.toFixed(2)}
              </Typography>

              <IconButton
                aria-label={t('Primary Icon')}
                className={classes.primaryButton}
              >
                {primary ? (
                  <StarIcon className={classes.starPrimary} />
                ) : (
                  <StarOutlineIcon
                    className={classes.starPrimary}
                    data-testid={`setPrimary-${id}`}
                    onClick={() => changePrimary(id)}
                  />
                )}
              </IconButton>
            </Box>
          </Box>
          <AppealProgressBar
            given={given}
            committed={committed}
            received={received}
            amount={amount}
            amountCurrency={amountCurrency}
          />
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default Appeal;
