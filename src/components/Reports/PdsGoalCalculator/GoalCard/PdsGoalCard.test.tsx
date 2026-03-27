// src/components/Reports/PdsGoalCalculator/GoalCard/PdsGoalCard.test.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCard } from './PdsGoalCard';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('PdsGoalCard', () => {
  it('renders the goal name and view link', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCard
              goal={{
                id: 'goal-1',
                name: 'Test PDS Goal',
                updatedAt: '2026-01-15T00:00:00Z',
              }}
            />
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByText('Test PDS Goal')).toBeInTheDocument();
    expect(getByText('View')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });
});
