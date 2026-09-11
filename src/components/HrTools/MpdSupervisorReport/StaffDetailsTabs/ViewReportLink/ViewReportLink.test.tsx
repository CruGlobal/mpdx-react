import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { ViewReportLink } from './ViewReportLink';

const staffAccountId = '1000000001';
const personNumber = '000000111';
const accountListId = 'account-list-1';
const router = { query: { accountListId }, isReady: true };

const renderViewReportLink = (
  staffAccountId: string | null,
  personNumber?: string,
  reportLink = 'staffExpense',
  reportName = 'Staff Expense',
) =>
  render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <ViewReportLink
          staffAccountId={staffAccountId}
          reportLink={reportLink}
          reportName={reportName}
          personNumber={personNumber}
        />
      </TestRouter>
    </ThemeProvider>,
  );

describe('ViewReportLink', () => {
  it('names the report in the link text', () => {
    const { getByRole } = renderViewReportLink(staffAccountId);

    expect(
      getByRole('link', { name: 'View Staff Expense Report' }),
    ).toBeInTheDocument();
  });

  it('points at the report for the given staff account', () => {
    const { getByRole } = renderViewReportLink(staffAccountId);

    expect(getByRole('link')).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/reports/staffExpense?staffAccountId=${staffAccountId}`,
    );
  });

  it('adds the person number when one is given', () => {
    const { getByRole } = renderViewReportLink(staffAccountId, personNumber);

    expect(getByRole('link')).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/reports/staffExpense?staffAccountId=${staffAccountId}&personNumber=${personNumber}`,
    );
  });

  it('explains the missing link when the staff member has no staff account', () => {
    const { getByText, queryByRole } = renderViewReportLink(null);

    expect(
      getByText('No staff account number is available for this staff member.'),
    ).toBeInTheDocument();
    expect(queryByRole('link')).not.toBeInTheDocument();
  });
});
