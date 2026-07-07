import type { FC } from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

export const GlobalStyles: FC = () => (
  <MuiGlobalStyles
    styles={{
      '*': {
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      },
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        height: '100%',
        width: '100%',
      },
      body: {
        height: '100%',
        minHeight: '100vh',
        width: '100%',
      },
      '#__next': {
        height: '100%',
        width: '100%',
      },
    }}
  />
);
