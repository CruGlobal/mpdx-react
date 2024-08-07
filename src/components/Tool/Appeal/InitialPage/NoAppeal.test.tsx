import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';
import NoAppeals from './NoAppeals';

describe('NoAppeals', () => {
  it('regular', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoAppeals />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(queryByText('No Appeals have been setup yet.')).toBeInTheDocument();
    expect(
      queryByText('No Primary Appeal has been selected.'),
    ).not.toBeInTheDocument();
  });

  it('primary', () => {
    const { queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper>
          <NoAppeals primary />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      queryByText('No Appeals have been setup yet.'),
    ).not.toBeInTheDocument();
    expect(
      queryByText('No Primary Appeal has been selected.'),
    ).toBeInTheDocument();
  });
});
