import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SearchMenuPanel } from './SearchMenuPanel';
import theme from 'src/theme';

describe('AddMenuPanel', () => {
  it('default', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <SearchMenuPanel />
      </ThemeProvider>,
    );

    expect(getByRole('textbox')).toBeInTheDocument();
  });
});
