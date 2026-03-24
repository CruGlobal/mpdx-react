import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { PdsGoalsList } from './PdsGoalsList';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
  push: jest.fn(),
};

describe('PdsGoalsList', () => {
  it('renders the create button', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <PdsGoalsList />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
  });
});
