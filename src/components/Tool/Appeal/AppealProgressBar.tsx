import React, { ReactElement } from 'react';
import { Box, Typography, Tooltip, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import theme from '../../../../src/theme';

const useStyles = makeStyles((theme: Theme) => ({
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

export interface Props {
  given: number;
  received: number;
  commited: number;
  amount: number;
  amountCurrency: string;
}

const AppealProgressBar = ({
  given,
  received,
  commited,
  amount,
  amountCurrency,
}: Props): ReactElement => {
  const classes = useStyles();

  return (
    <>
      <Box display="flex" justifyContent="end">
        <Tooltip title="Given" placement="top" arrow>
          <Typography
            variant="body2"
            display="inline"
            className={classes.colorYellow}
          >
            {given} {amountCurrency} (
            {`${((given / (amount || 1)) * 100).toFixed(0)}%`})
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
            {received + given} {amountCurrency} (
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
        <Tooltip title="Commited" placement="top" arrow>
          <Typography
            variant="body2"
            display="inline"
            className={classes.colorLightGray}
          >
            {commited + received + given} {amountCurrency} (
            {`${(((commited + received + given) / (amount || 1)) * 100).toFixed(
              0,
            )}%`}
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
                borderTopRightRadius: !received && !commited ? 8 : 0,
                borderBottomRightRadius: !received && !commited ? 8 : 0,
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
                borderTopRightRadius: !commited ? 8 : 0,
                borderBottomRightRadius: !commited ? 8 : 0,
              }}
            />
          </Tooltip>
          <Tooltip title="Commited" placement="top-start" arrow>
            <Box
              style={{
                minWidth: `${(commited / (amount || 1)) * 100}%`,
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
