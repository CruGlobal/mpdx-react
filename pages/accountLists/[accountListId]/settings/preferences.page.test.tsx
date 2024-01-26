import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import theme from '../../../../src/theme';
import Preferences from './preferences.page';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const mocks = {
  GetAccountPreferences: {
    user: {
      id: '1',
    },
    accountList: {
      id: '1',
      name: 'test',
      activeMpdMonthlyGoal: null,
      activeMpdFinishAt: null,
      activeMpdStartAt: null,
      salaryOrganizationId: null,
      settings: {
        currency: 'USD',
        homeCountry: 'USA',
        monthlyGoal: 100,
        tester: true,
      },
    },
    accountLists: {
      nodes: [
        {
          name: 'test',
          id: '1',
        },
        {
          name: 'test',
          id: '1',
        },
      ],
    },
  },
  GetPersonalPreferences: {
    user: {
      preferences: {
        timeZone: '',
        localeDisplay: 'en',
        locale: 'en',
        hourToSendNotifications: 8,
      },
    },
  },
  GetProfileInfo: {
    user: {
      anniversaryYear: 2020,
      anniversaryDay: 1,
      anniversaryMonth: 1,
      birthdayDay: 1,
      birthdayMonth: 1,
      birthdayYear: 1900,
    },
  },
  GetUsersOrganizationsAccounts: {
    userOrganizationAccounts: [
      {
        organization: {},
      },
      {
        organization: {},
      },
    ],
  },
  CanUserExportData: {
    canUserExportData: {
      allowed: false,
      exportedAt: null,
    },
  },
};

const MocksProviders = (props: { children: JSX.Element }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider mocks={mocks}>{props.children}</GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Preferences page', () => {
  it('should not render Export All Data accordion', async () => {
    const { findByText, queryByText } = render(
      <MocksProviders>
        <Preferences />
      </MocksProviders>,
    );
    //canUserExportData.allowed is false
    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(await findByText('Account Preferences')).toBeInTheDocument();
    expect(await queryByText('Export All Data')).not.toBeInTheDocument();
  });

  it('should render Primary Organization accordion when there are multiple orgs', async () => {
    const { findByText, queryByText } = render(
      <MocksProviders>
        <Preferences />
      </MocksProviders>,
    );
    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(await findByText('Account Preferences')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('Primary Organization')).toBeInTheDocument(),
    );
  });
});
