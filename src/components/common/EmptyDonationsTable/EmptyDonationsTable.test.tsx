import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import { EmptyDonationsTable } from './EmptyDonationsTable';
import TestRouter from '__tests__/util/TestRouter';

const router = {
  query: { accountListId: 'abc-123' },
  isReady: true,
};

it('renders', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <EmptyDonationsTable
          title={'You have no expected donations this month'}
        />
      </TestRouter>
    </ThemeProvider>,
  );

  expect(
    getByText('You have no expected donations this month'),
  ).toBeInTheDocument();
});
