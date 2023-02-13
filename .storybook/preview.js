import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { configure, addDecorator, addParameters } from '@storybook/react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { Settings } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '../__tests__/util/TestRouter';
import theme from '../src/theme';
import i18n from '../src/lib/i18n';

Settings.now = () => new Date(2020, 0, 1).valueOf();

addDecorator((StoryFn) => (
  <MockedProvider mocks={[]} addTypename={false}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider maxSnack={3}>
          <TestRouter>
            <StoryFn />
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </MockedProvider>
));

addParameters({
  chromatic: { diffThreshold: true },
  i18n,
  locale: 'en',
  locales: {
    en: 'English',
    de: 'German',
    ru: 'Russian',
    tr: 'Turkish',
  },
});

// automatically import all files ending in *.stories.tsx
configure(
  require.context('../src/components', true, /\.stories\.tsx?$/),
  module,
);
