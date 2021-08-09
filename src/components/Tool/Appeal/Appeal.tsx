import { Box, CardContent, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';

export interface Props {
  name: string;
  amount: number;
  amountCurrency: string;
  given: number;
  received: number;
  commited: number;
  total: number;
}

const Appeal = ({
  name,
  amount,
  amountCurrency,
  given,
  received,
  commited,
}: Props): ReactElement => {
  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" display="inline">
              {name}
            </Typography>
            <Typography variant="h6" display="inline">
              {given.toFixed(2)} / {amount.toFixed(2)}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="end">
            <Typography
              variant="body2"
              display="inline"
              style={{ color: theme.palette.progressBarYellow.main }}
            >
              {given} {amountCurrency} (
              {`${((given / amount) * 100).toFixed(0)}%`})
            </Typography>
            <Typography
              variant="body2"
              display="inline"
              style={{
                padding: '0 3px 0 3px',
              }}
            >
              /
            </Typography>
            <Typography
              variant="body2"
              display="inline"
              style={{ color: theme.palette.progressBarOrange.main }}
            >
              {received} {amountCurrency} (
              {`${((received / amount) * 100).toFixed(0)}%`})
            </Typography>
            <Typography
              variant="body2"
              display="inline"
              style={{
                padding: '0 3px 0 3px',
              }}
            >
              /
            </Typography>
            <Typography
              variant="body2"
              display="inline"
              style={{ color: theme.palette.progressBarGray.main }}
            >
              {commited} {amountCurrency} (
              {`${((commited / amount) * 100).toFixed(0)}%`})
            </Typography>
          </Box>
          <Box
            display="flex"
            justifyContent="flex-start"
            style={{
              backgroundColor: theme.palette.cruGrayDark.main,
              width: '100%',
              height: '30px',
              borderRadius: 10,
              overflowX: 'hidden',
            }}
          >
            <Box
              style={{
                width: `${(given / amount) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.progressBarYellow.main,
              }}
            ></Box>
            <Box
              style={{
                width: `${(received / amount) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.progressBarOrange.main,
              }}
            ></Box>
            <Box
              style={{
                width: `${(commited / amount) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.progressBarGray.main,
              }}
            ></Box>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default Appeal;
