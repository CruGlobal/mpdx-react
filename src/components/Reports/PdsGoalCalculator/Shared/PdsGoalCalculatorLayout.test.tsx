// src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorLayout.test.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculatorProvider } from './PdsGoalCalculatorContext';
import { PdsGoalCalculatorLayout } from './PdsGoalCalculatorLayout';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('PdsGoalCalculatorLayout', () => {
  it('renders the layout with sidebar and main content', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCalculatorProvider>
              <PdsGoalCalculatorLayout
                sectionListPanel={<div>Section List</div>}
                mainContent={<div>Main Content</div>}
              />
            </PdsGoalCalculatorProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Main Content')).toBeInTheDocument();
  });
});
