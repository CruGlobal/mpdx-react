import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import {
  GetWeeklyActivityQueryDefaultMocks,
  GetWeeklyActivityQueryLoadingMocks,
} from './WeeklyActivity.mock';
import {
  EmptyCoachingAnswerSetMock,
  PopulateCoachingAnswerSetMock,
} from './WeeklyReportModal/WeeklyReport.mock';
import WeeklyActivity from '.';

// Mock the useOrganizationId hook
jest.mock('src/hooks/useOrganizationId', () => ({
  useOrganizationId: () => 'org-123',
}));

const accountListId = 'abc';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId },
      isReady: true,
    };
  },
}));

describe('WeeklyActivity', () => {
  it('loading', () => {
    const { getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={GetWeeklyActivityQueryLoadingMocks()}
          addTypename={false}
        >
          <WeeklyActivity accountListId={accountListId} />
        </MockedProvider>
      </SnackbarProvider>,
    );

    expect(
      getByTestId('WeeklyActivityTableCellCompletedInitiations').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedAppointments').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedFollowUps').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedPartnerCare').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
  });

  it('default', async () => {
    const { getByTestId, queryByTestId, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={GetWeeklyActivityQueryDefaultMocks()}
          addTypename={false}
        >
          <WeeklyActivity accountListId={accountListId} />
        </MockedProvider>
      </SnackbarProvider>,
    );
    expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual(
      'Dec 29 - Jan 4',
    );
    await waitFor(() =>
      expect(
        queryByTestId('WeeklyActivitySkeletonLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(
      getByTestId('WeeklyActivityTableCellCompletedInitiations').textContent,
    ).toEqual('1,234');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedAppointments').textContent,
    ).toEqual('7,890');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedFollowUps').textContent,
    ).toEqual('9,012');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedPartnerCare').textContent,
    ).toEqual('1,234');
    fireEvent.click(getByTestId('WeeklyActivityIconButtonSubtractWeek'));
    await waitFor(() =>
      expect(
        queryByTestId('WeeklyActivitySkeletonLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual(
      'Dec 22 - Dec 28',
    );
    expect(
      getByTestId('WeeklyActivityTableCellCompletedInitiations').textContent,
    ).toEqual('5,678');
    fireEvent.click(getByTestId('WeeklyActivityIconButtonAddWeek'));
    await waitFor(() =>
      expect(
        queryByTestId('WeeklyActivitySkeletonLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('WeeklyActivityTableCellDateRange').textContent).toEqual(
      'Dec 29 - Jan 4',
    );
    expect(
      getByTestId('WeeklyActivityTableCellCompletedInitiations').textContent,
    ).toEqual('1,234');
    expect(
      getByRole('link', { hidden: true, name: 'View Activity Detail' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/reports/coaching`,
    );
  });

  it('opens weekly activity modal', async () => {
    const { findByLabelText, findByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MockedProvider
            mocks={[
              ...GetWeeklyActivityQueryDefaultMocks(),
              PopulateCoachingAnswerSetMock(),
            ]}
            addTypename={false}
          >
            <WeeklyActivity accountListId={accountListId} />
          </MockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(
      await findByRole('button', { name: 'Fill out weekly report' }),
    );
    expect(await findByLabelText('Weekly Report')).toBeInTheDocument();
  });

  it('should not show Fill out weekly report button', async () => {
    const { queryByRole, findByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MockedProvider
            mocks={[
              ...GetWeeklyActivityQueryDefaultMocks(),
              EmptyCoachingAnswerSetMock(),
            ]}
            addTypename={false}
          >
            <WeeklyActivity accountListId={accountListId} />
          </MockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(
      await findByRole('link', { name: 'View Activity Detail' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        queryByRole('button', { name: 'Fill out weekly report' }),
      ).not.toBeInTheDocument();
    });
  });
});
