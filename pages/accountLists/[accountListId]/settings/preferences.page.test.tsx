import { NextRouter } from 'next/router';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MailchimpAccountQuery } from 'src/components/Settings/integrations/Mailchimp/MailchimpAccount.generated';
import { GetUsersOrganizationsAccountsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { PrayerlettersAccountQuery } from 'src/components/Settings/integrations/Prayerletters/PrayerlettersAccount.generated';
import {
  CanUserExportDataQuery,
  GetAccountPreferencesQuery,
} from 'src/components/Settings/preferences/GetAccountPreferences.generated';
import { GetPersonalPreferencesQuery } from 'src/components/Settings/preferences/GetPersonalPreferences.generated';
import { GetProfileInfoQuery } from 'src/components/Settings/preferences/GetProfileInfo.generated';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import Preferences from './preferences.page';

const accountListId = 'account-list-1';

const mockEnqueue = jest.fn();
const mutationSpy = jest.fn();
const push = jest.fn();

const defaultRouter = {
  query: { accountListId },
  pathname: '/accountLists/[accountListId]/settings/preferences',
  isReady: true,
  push,
};

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

interface MocksProvidersProps {
  children: JSX.Element;
  canUserExportData: boolean;
  singleOrg?: boolean;
  setup?: boolean;
  router?: Partial<NextRouter> | undefined;
}

const MocksProviders: React.FC<MocksProvidersProps> = ({
  children,
  canUserExportData,
  singleOrg,
  setup = false,
  router = defaultRouter,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetUsersOrganizationsAccounts: GetUsersOrganizationsAccountsQuery;
        MailchimpAccount: MailchimpAccountQuery;
        PrayerlettersAccount: PrayerlettersAccountQuery;
        GetAccountPreferences: GetAccountPreferencesQuery;
        GetPersonalPreferences: GetPersonalPreferencesQuery;
        GetProfileInfo: GetProfileInfoQuery;
        CanUserExportData: CanUserExportDataQuery;
      }>
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
            userOrganizationAccounts: singleOrg
              ? [{ organization: {} }]
              : [{ organization: {} }, { organization: {} }],
          },
          CanUserExportData: {
            canUserExportData: {
              allowed: canUserExportData,
              exportedAt: null,
            },
          },
        }}
        onCall={mutationSpy}
      >
        <TestSetupProvider onSetupTour={setup}>{children}</TestSetupProvider>
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
  describe('Export Redirect', () => {
    it('redirects when exportId is provided in the URL', () => {
      const router = {
        isReady: true,
        query: {
          exportId: 'export_id',
          accountListId,
        },
      };

      const {} = render(
        <MocksProviders
          canUserExportData={false}
          singleOrg={true}
          router={router}
        >
          <Preferences />
        </MocksProviders>,
      );

      expect(window.location.replace).toHaveBeenCalledWith(
        `${
          process.env.REST_API_URL
        }/account_lists/${accountListId}/exports/${encodeURIComponent(
          'export_id',
        )}.xml?access_token=${session.user.apiToken}`,
      );
    });
  });

  describe('Setup Tour', () => {
    it('should not show setup banner and accordions should not be disabled', async () => {
      const { queryByText, queryByRole, findByText, getByText, getByRole } =
        render(
          <MocksProviders canUserExportData={false} singleOrg={true}>
            <Preferences />
          </MocksProviders>,
        );

      expect(
        getByRole('button', { name: 'Reset Welcome Tour' }),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(queryByText("Let's set your locale!")).not.toBeInTheDocument();
        expect(
          queryByRole('button', { name: 'Skip Step' }),
        ).not.toBeInTheDocument();
      });

      //Accordions should be clickable
      userEvent.click(await findByText('Language'));
      await waitFor(() => {
        expect(
          getByText('The language determines your default language for .'),
        ).toBeVisible();
      });
    });

    it('should show setup banner and open locale', async () => {
      const { findByRole, findByText, getByRole, queryByText } = render(
        <MocksProviders canUserExportData={false} singleOrg={true} setup>
          <Preferences />
        </MocksProviders>,
      );

      //Accordions should be disabled
      expect(await findByRole('button', { name: 'Language' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      await waitFor(() => {
        expect(
          queryByText('The language determines your default language for .'),
        ).not.toBeInTheDocument();
      });

      // Start with Locale
      expect(await findByText("Let's set your locale!")).toBeInTheDocument();
      expect(
        await findByText(
          'The locale determines how numbers, dates and other information are formatted.',
        ),
      ).toBeInTheDocument();

      // Moves to Monthly Goal
      userEvent.click(getByRole('button', { name: 'Save' }));
      expect(
        await findByText('Great progress comes from great goals!'),
      ).toBeInTheDocument();
      expect(
        await findByText(
          'This amount should be set to the amount your organization has determined is your target monthly goal. If you do not know, make your best guess for now. You can change it at any time.',
        ),
      ).toBeInTheDocument();

      // Home Country
      const skipButton = getByRole('button', { name: 'Skip Step' });
      userEvent.click(skipButton);
      expect(
        await findByText(
          'This should be the place from which you are living and sending out physical communications. This will be used in exports for mailing address information.',
        ),
      ).toBeInTheDocument();

      // Move to Notifications
      userEvent.click(skipButton);
      await waitFor(() => {
        expect(mutationSpy).toHaveGraphqlOperation('UpdateUserOption', {
          key: 'setup_position',
          value: 'preferences.notifications',
        });
        expect(push).toHaveBeenCalledWith(
          '/accountLists/account-list-1/settings/notifications',
        );
      });
    });
  });
});
