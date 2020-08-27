import React from 'react';
import { configure } from '@storybook/react';
import { addDecorator, addParameters } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { withKnobs } from '@storybook/addon-knobs';
import { withI18next } from 'storybook-addon-i18next';
import MockDate from 'mockdate';
import isChromatic from 'chromatic/isChromatic';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import theme from '../src/theme';
import i18n from '../src/lib/i18n';

if (isChromatic()) {
    MockDate.set(new Date(2020, 1, 1));
}

addDecorator(
    withI18next({
        i18n,
        languages: {
            en: 'English',
            de: 'German',
        },
    }),
);

addDecorator((storyFn) => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {storyFn()}
        </MuiPickersUtilsProvider>
    </ThemeProvider>
));
addDecorator(withKnobs);
addParameters({ chromatic: { diffThreshold: true } });

// automatically import all files ending in *.stories.tsx
configure(require.context('../src/components', true, /\.stories\.tsx?$/), module);
