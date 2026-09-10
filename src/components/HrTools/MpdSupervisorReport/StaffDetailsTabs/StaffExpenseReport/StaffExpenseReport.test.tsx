import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { StaffTabStaffExpenseReport } from './StaffExpenseReport';

const staffAccountId = '1000000001';
const accountListId = 'account-list-1';
const router = { query: { accountListId }, isReady: true };

const renderStaffExpenseReport = (staffAccountId: string | null) =>
  render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <StaffTabStaffExpenseReport staffAccountId={staffAccountId} />
      </TestRouter>
    </ThemeProvider>,
  );

describe('StaffTabStaffExpenseReport', () => {
  it('links to the staff member staff expense report', () => {
    const { getByRole } = renderStaffExpenseReport(staffAccountId);

    expect(
      getByRole('link', { name: 'View Staff Expense Report' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/reports/staffExpense?staffAccountId=${staffAccountId}`,
    );
  });
});
