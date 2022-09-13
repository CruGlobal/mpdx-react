import React from 'react';
import { configure } from '@storybook/react';
import { addDecorator, addParameters } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { withI18next } from 'storybook-addon-i18next';
import { Settings } from 'luxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { SnackbarProvider } from 'notistack';
import { MockedProvider } from '@apollo/client/testing';
import TestRouter from '../__tests__/util/TestRouter';
import theme from '../src/theme';
import i18n from '../src/lib/i18n';

Settings.now = () => new Date(2020, 0, 1).valueOf();

addDecorator(
  withI18next({
    i18n,
    languages: {
      en: 'English',
      de: 'German',
    },
  }),
);
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

addParameters({ chromatic: { diffThreshold: true } });

// automatically import all files ending in *.stories.tsx
configure(
  require.context('../src/components', true, /\.stories\.tsx?$/),
  module,
);
