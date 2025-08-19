import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestWrapper from '__tests__/util/TestWrapper';
import theme from 'src/theme';
import { SpouseIncomeHelperPanel } from './SpouseIncomeHelperPanel';

describe('SpouseIncomeHelperPanel', () => {
  it('renders the helper panel with correct text', () => {
    const { getByText } = render(
      <TestWrapper>
        <ThemeProvider theme={theme}>
          <SpouseIncomeHelperPanel />
        </ThemeProvider>
      </TestWrapper>,
    );

    expect(
      getByText(
        "The amount entered here will be reflected in your total MPD goal. To look at your goal without spouse's salary, leave this blank.",
      ),
    ).toBeInTheDocument();
  });
});
