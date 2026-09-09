import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { StaffTabMPGA } from './MPGA';

const staffAccountId = '1000000001';
const accountListId = 'account-list-1';
const router = { query: { accountListId }, isReady: true };

const renderMPGA = (staffAccountId: string | null) =>
  render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <StaffTabMPGA staffAccountId={staffAccountId} />
      </TestRouter>
    </ThemeProvider>,
  );

describe('StaffTabMPGA', () => {
  it('links to the staff member MPGA report', () => {
    const { getByRole } = renderMPGA(staffAccountId);

    expect(getByRole('link', { name: 'View MPGA Report' })).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/reports/mpgaIncomeExpenses?staffAccountId=1000000001`,
    );
  });
});
