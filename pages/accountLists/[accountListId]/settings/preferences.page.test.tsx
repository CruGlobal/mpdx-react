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

const MocksProviders = (props: {
  children: JSX.Element;
  canUserExportData: boolean;
  singleOrg?: boolean;
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider
        mocks={{
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
            userOrganizationAccounts: props.singleOrg
              ? [
                  {
                    organization: {},
                  },
                ]
              : [
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
              allowed: props.canUserExportData,
              exportedAt: null,
            },
          },
        }}
      >
        {props.children}
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('Preferences page', () => {
  it('should not render Export All Data accordion', async () => {
    const { findByText, queryByText } = render(
      <MocksProviders canUserExportData={false}>
        <Preferences />
      </MocksProviders>,
    );
    //canUserExportData.allowed is false
    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(await findByText('Account Preferences')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('Export All Data')).not.toBeInTheDocument(),
    );
  });

  it('should render Export All Data accordion if allowed is true', async () => {
    const { findByText } = render(
      <MocksProviders canUserExportData={true}>
        <Preferences />
      </MocksProviders>,
    );
    //canUserExportData.allowed is true
    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(await findByText('Account Preferences')).toBeInTheDocument();
    expect(await findByText('Export All Data')).toBeInTheDocument();
  });

  it('should render Primary Organization accordion when there are multiple orgs', async () => {
    const { findByText, queryByText } = render(
      <MocksProviders canUserExportData={false}>
        <Preferences />
      </MocksProviders>,
    );
    expect(await findByText('Preferences')).toBeInTheDocument();
    expect(await findByText('Account Preferences')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('Primary Organization')).toBeInTheDocument(),
    );
  });

  it('should not render Primary Organization accordion when there is only 1 org', async () => {
    const { queryByText } = render(
      <MocksProviders canUserExportData={false} singleOrg={true}>
        <Preferences />
      </MocksProviders>,
    );
    await waitFor(() =>
      expect(queryByText('Primary Organization')).not.toBeInTheDocument(),
    );
  });
});
