import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { AppProviderContext } from '../../App/Provider';
import {
  GetThisWeekEmptyMocks,
  GetThisWeekLoadingMocks,
  GetThisWeekDefaultMocks,
} from './ThisWeek.mock';
import ThisWeek from '.';
import { ThemeProvider } from '@material-ui/core';
import theme from '../../../theme';

jest.mock('../../App', () => ({
  useApp: (): Partial<AppProviderContext> => ({
    openTaskDrawer: jest.fn(),
  }),
}));

describe('ThisWeek', () => {
  it('default', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={GetThisWeekDefaultMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('PartnerCarePrayerListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(getByTestId('PartnerCarePrayerList')).toBeInTheDocument();
    expect(getByTestId('TasksDueThisWeekList')).toBeInTheDocument();
    expect(getByTestId('LateCommitmentsListContacts')).toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecentList')).toBeInTheDocument();
    expect(getByTestId('AppealsBoxName')).toBeInTheDocument();
  });

  it('loading', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={GetThisWeekLoadingMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    expect(getByTestId('PartnerCarePrayerListLoading')).toBeInTheDocument();
    expect(getByTestId('TasksDueThisWeekListLoading')).toBeInTheDocument();
    expect(getByTestId('LateCommitmentsDivLoading')).toBeInTheDocument();
    expect(getByTestId('ReferralsTabRecentListLoading')).toBeInTheDocument();
  });

  it('empty', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MockedProvider mocks={GetThisWeekEmptyMocks()} addTypename={false}>
            <ThisWeek accountListId="abc" />
          </MockedProvider>
        </SnackbarProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('PartnerCarePrayerListLoading'),
      ).not.toBeInTheDocument(),
    );
    expect(
      getByTestId('PartnerCarePrayerCardContentEmpty'),
    ).toBeInTheDocument();
    expect(getByTestId('TasksDueThisWeekCardContentEmpty')).toBeInTheDocument();
    expect(getByTestId('LateCommitmentsCardContentEmpty')).toBeInTheDocument();
    expect(
      getByTestId('ReferralsTabRecentCardContentEmpty'),
    ).toBeInTheDocument();
    expect(getByTestId('AppealsCardContentEmpty')).toBeInTheDocument();
  });
});
