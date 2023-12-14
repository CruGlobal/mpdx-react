import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../theme';
import { EmptyDonationsTable } from './EmptyDonationsTable';

const router = {
  query: { accountListId: 'abc-123' },
  isReady: true,
};

describe('EmptyDonationsTable', () => {
  it('renders', async () => {
    const { findByRole, getByRole, getByText, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <GqlMockedProvider>
              <SnackbarProvider>
                <EmptyDonationsTable
                  title={'You have no expected donations this month'}
                />
              </SnackbarProvider>
            </GqlMockedProvider>
          </LocalizationProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(
      getByText('You have no expected donations this month'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Add New Donation' }));
    expect(
      await findByRole('heading', { name: 'Add Donation' }),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        queryByRole('heading', { name: 'Add Donation' }),
      ).not.toBeInTheDocument(),
    );
  });
});
