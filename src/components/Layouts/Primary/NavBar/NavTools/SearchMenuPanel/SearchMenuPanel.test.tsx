import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import theme from 'src/theme';
import { SearchMenuPanel } from './SearchMenuPanel';

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
