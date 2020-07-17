import React from 'react';
import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import { withKnobs } from "@storybook/addon-knobs";
import theme from '../src/theme';

addDecorator(storyFn => <ThemeProvider theme={theme}><CssBaseline />{storyFn()}</ThemeProvider>);
addDecorator(withKnobs);

// automatically import all files ending in *.stories.tsx
configure(require.context('../src/components', true, /\.stories\.tsx?$/), module);
