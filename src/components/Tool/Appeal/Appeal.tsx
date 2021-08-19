import { Box, CardContent, Typography, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';
import AppealProgressBar from './AppealProgressBar';

export interface Props {
  name: string;
  primary: boolean;
  amount: number;
  amountCurrency: string;
  given: number;
  received: number;
  commited: number;
  total: number;
}

const useStyles = makeStyles(() => ({
  cardContent: {
    marginTop: -theme.spacing(2),
  },
  starPrimary: {
    color: theme.palette.mpdxBlue.main,
    transform: `translateY(${theme.spacing(0.5)}px)`,
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.progressBarYellow.main,
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
    backgroundColor: theme.palette.cruGrayDark.main,
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
}));

const Appeal = ({
  name,
  primary,
  amount,
  amountCurrency,
  given,
  received,
  commited,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent className={classes.cardContent}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" display="inline">
              {name}
            </Typography>
            <Box>
              <Typography variant="h6" display="inline">
                {given.toFixed(2)} / {amount.toFixed(2)}
              </Typography>
              {primary ? (
                <StarIcon className={classes.starPrimary} />
              ) : (
                <StarOutlineIcon className={classes.starPrimary} />
              )}
            </Box>
          </Box>
          <AppealProgressBar
            given={given}
            commited={commited}
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
