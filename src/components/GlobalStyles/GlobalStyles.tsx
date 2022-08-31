import type { FC } from 'react';
import { createStyles, makeStyles } from '@mui/material';

const useStyles = makeStyles(() =>
  createStyles({
    '@global': {
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        '-webkit-font-smoothing': 'antialiased',
        '-moz-osx-font-smoothing': 'grayscale',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      },
      body: {
        height: '100%',
        width: '100%',
      },
      '#__next': {
        height: '100%',
        width: '100%',
      },
    },
  }),
);

export const GlobalStyles: FC = () => {
  useStyles();

  return null;
};
