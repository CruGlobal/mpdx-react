import React from 'react';
import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { withKnobs } from '@storybook/addon-knobs';
import MockDate from 'mockdate';
import isChromatic from 'chromatic/isChromatic';
import theme from '../src/theme';

if(isChromatic()) {
    MockDate.set(new Date(2020, 1, 1));
}

addDecorator((storyFn) => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        {storyFn()}
    </ThemeProvider>
));
addDecorator(withKnobs);

// automatically import all files ending in *.stories.tsx
configure(require.context('../src/components', true, /\.stories\.tsx?$/), module);
