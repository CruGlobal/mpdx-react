import React, { ReactElement, useMemo } from 'react';
import { Box, Theme, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from '../../../theme';

const useStyles = makeStyles()((theme: Theme) => ({
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

export interface AppealProgressBarProps {
  given: number;
  received: number;
  committed: number;
  amount: number;
  amountCurrency: string;
}

const AppealProgressBar = ({
  given,
  received,
  committed,
  amount,
  amountCurrency,
}: AppealProgressBarProps): ReactElement => {
  const { classes } = useStyles();
  const locale = useLocale();
  const givenAmount = useMemo(
    () => currencyFormat(given, amountCurrency, locale),
    [given, amountCurrency, locale],
  );
  const receivedAmount = useMemo(
    () => currencyFormat(received + given, amountCurrency, locale),
    [given, received, amountCurrency, locale],
  );
  const committedAmount = useMemo(
    () => currencyFormat(committed + received + given, amountCurrency, locale),
    [given, received, committed, amountCurrency, locale],
  );

  return (
    <>
      <Box display="flex" justifyContent="end">
        <Tooltip title="Given" placement="top" arrow>
          <Typography
            variant="body2"
            display="inline"
            className={classes.colorYellow}
          >
            {givenAmount} ({`${((given / (amount || 1)) * 100).toFixed(0)}%`})
          </Typography>
        </Tooltip>
        <Typography
          variant="body2"
          display="inline"
          style={{
            padding: '0 3px 0 3px',
          }}
        >
          /
        </Typography>
        <Tooltip title="Received" placement="top" arrow>
          <Typography
            variant="body2"
            display="inline"
            className={classes.colorOrange}
          >
            {receivedAmount} (
            {`${(((received + given) / (amount || 1)) * 100).toFixed(0)}%`})
          </Typography>
        </Tooltip>
        <Typography
          variant="body2"
          display="inline"
          style={{
            padding: '0 3px 0 3px',
          }}
        >
          /
        </Typography>
        <Tooltip title="committed" placement="top" arrow>
          <Typography
            variant="body2"
            display="inline"
            className={classes.colorLightGray}
          >
            {committedAmount} (
            {`${(
              ((committed + received + given) / (amount || 1)) *
              100
            ).toFixed(0)}%`}
            )
          </Typography>
        </Tooltip>
      </Box>
      <Box className={classes.progressBarOuter}>
        <Box
          display="flex"
          justifyContent="flex-start"
          className={classes.progressBarInner}
        >
          <Tooltip title="Given" placement="top-start" arrow>
            <Box
              style={{
                minWidth: `min(${(given / (amount || 1)) * 100}%,100%)`,
                height: '100%',
                backgroundColor: theme.palette.progressBarYellow.main,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                borderTopRightRadius: !received && !committed ? 8 : 0,
                borderBottomRightRadius: !received && !committed ? 8 : 0,
              }}
            />
          </Tooltip>
          <Tooltip title="Received" placement="top-start" arrow>
            <Box
              style={{
                minWidth: `${(received / (amount || 1)) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.progressBarOrange.main,
                borderTopLeftRadius: !given ? 8 : 0,
                borderBottomLeftRadius: !given ? 8 : 0,
                borderTopRightRadius: !committed ? 8 : 0,
                borderBottomRightRadius: !committed ? 8 : 0,
              }}
            />
          </Tooltip>
          <Tooltip title="Committed" placement="top-start" arrow>
            <Box
              style={{
                minWidth: `${(committed / (amount || 1)) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.progressBarGray.main,
                borderTopLeftRadius: !given && !received ? 8 : 0,
                borderBottomLeftRadius: !given && !received ? 8 : 0,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              }}
            ></Box>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default AppealProgressBar;
