import React from 'react';
import { configure } from '@storybook/react';
import { addDecorator } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import theme from '../src/theme';


addDecorator(storyFn => <ThemeProvider theme={theme}><CssBaseline />{storyFn()}</ThemeProvider>);

// automatically import all files ending in *.stories.tsx
configure(require.context('../src/components', true, /\.stories\.tsx?$/), module);
