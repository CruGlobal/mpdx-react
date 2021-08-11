import { Box, CardContent, Typography, Tooltip } from '@material-ui/core';
import React, { ReactElement } from 'react';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';

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

const Appeal = ({
  name,
  primary,
  amount,
  amountCurrency,
  given,
  received,
  commited,
}: Props): ReactElement => {
  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent
          style={{
            marginTop: -theme.spacing(2),
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" display="inline">
              {name}
            </Typography>
            <Box>
              <Typography variant="h6" display="inline">
                {given.toFixed(2)} / {amount.toFixed(2)}
              </Typography>
              {primary ? (
                <StarIcon
                  style={{
                    color: theme.palette.mpdxBlue.main,
                    transform: `translateY(${theme.spacing(0.5)}px)`,
                  }}
                />
              ) : (
                <StarOutlineIcon
                  style={{
                    color: theme.palette.mpdxBlue.main,
                    transform: `translateY(${theme.spacing(0.5)}px)`,
                  }}
                />
              )}
            </Box>
          </Box>
          <Box display="flex" justifyContent="end">
            <Tooltip title="Given" placement="top" arrow>
              <Typography
                variant="body2"
                display="inline"
                style={{ color: theme.palette.progressBarYellow.main }}
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
                style={{ color: theme.palette.progressBarOrange.main }}
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
                style={{ color: theme.palette.progressBarGray.main }}
              >
                {commited + received + given} {amountCurrency} (
                {`${(
                  ((commited + received + given) / (amount || 1)) *
                  100
                ).toFixed(0)}%`}
                )
              </Typography>
            </Tooltip>
          </Box>
          <Box
            style={{
              backgroundColor: theme.palette.cruGrayDark.main,
              width: '100%',
              height: '30px',
              borderRadius: 10,
              padding: 3,
            }}
          >
            <Box
              display="flex"
              justifyContent="flex-start"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 8,
                overflowX: 'hidden',
              }}
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
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default Appeal;
