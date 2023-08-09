import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import {
  GetWeeklyActivityQueryDefaultMocks,
  GetWeeklyActivityQueryLoadingMocks,
} from './WeeklyActivity.mock';
import WeeklyActivity from '.';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId: 'abc' },
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
          <WeeklyActivity accountListId="abc" />
        </MockedProvider>
      </SnackbarProvider>,
    );

    expect(
      getByTestId('WeeklyActivityTableCellCompletedCalls').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCallsThatProducedAppointments')
        .children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedMessages').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellMessagesThatProducedAppointments')
        .children[0].className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedAppointments').children[0]
        .className,
    ).toContain('MuiSkeleton-root');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedCorrespondence').children[0]
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
          <WeeklyActivity accountListId="abc" />
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
      getByTestId('WeeklyActivityTableCellCompletedCalls').textContent,
    ).toEqual('1,234');
    expect(
      getByTestId('WeeklyActivityTableCellCallsThatProducedAppointments')
        .textContent,
    ).toEqual('5,678');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedMessages').textContent,
    ).toEqual('9,012');
    expect(
      getByTestId('WeeklyActivityTableCellMessagesThatProducedAppointments')
        .textContent,
    ).toEqual('3,456');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedAppointments').textContent,
    ).toEqual('7,890');
    expect(
      getByTestId('WeeklyActivityTableCellCompletedCorrespondence').textContent,
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
      getByTestId('WeeklyActivityTableCellCompletedCalls').textContent,
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
      getByTestId('WeeklyActivityTableCellCompletedCalls').textContent,
    ).toEqual('1,234');
    expect(
      getByRole('link', { hidden: true, name: 'View Activity Detail' }),
    ).toHaveAttribute(
      'href',
      `https://${process.env.REWRITE_DOMAIN}/reports/coaching`,
    );
  });

  it('opens weekly activity modal', async () => {
    const { findByLabelText, findByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <MockedProvider
            mocks={GetWeeklyActivityQueryDefaultMocks()}
            addTypename={false}
          >
            <WeeklyActivity accountListId="abc" />
          </MockedProvider>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    userEvent.click(
      await findByRole('button', { name: 'Fill out weekly report' }),
    );
    expect(await findByLabelText('Weekly Report')).toBeInTheDocument();
  });
});
