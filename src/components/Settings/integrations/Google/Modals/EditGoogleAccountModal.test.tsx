import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AppSettingsContext } from 'src/components/common/AppSettings/AppSettingsProvider';
import {
  ActivityTypeEnum,
  GoogleAccountIntegration,
  GoogleAccountIntegrationCalendars,
  Maybe,
} from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from '../../../../../theme';
import { EditGoogleAccountModal } from './EditGoogleAccountModal';
import { GoogleAccountIntegrationsQuery } from './googleIntegrations.generated';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
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

const handleClose = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <AppSettingsContext.Provider value={{ appName: 'MPDX' }}>
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </TestRouter>
      </SnackbarProvider>
    </I18nextProvider>
  </AppSettingsContext.Provider>
);

const googleAccount = {
  email: 'test-n-rest@cru.org',
  primary: false,
  remoteId: '111222333444',
  id: 'abcd1234',
  tokenExpired: false,
};

const standardGoogleIntegration: Pick<
  GoogleAccountIntegration,
  | 'calendarId'
  | 'calendarIntegration'
  | 'calendarIntegrations'
  | 'calendarName'
  | 'createdAt'
  | 'updatedAt'
  | 'id'
  | 'updatedInDbAt'
> & {
  calendars: Array<
    Maybe<Pick<GoogleAccountIntegrationCalendars, 'id' | 'name'>>
  >;
} = {
  calendarId: null,
  calendarIntegration: true,
  calendarIntegrations: [ActivityTypeEnum.AppointmentInPerson],
  calendarName: 'calendar',
  calendars: [
    {
      id: 'calendarsID',
      name: 'calendarsName@cru.org',
    },
  ],
  createdAt: '08/08/2023',
  updatedAt: '08/08/2023',
  id: 'ID',
  updatedInDbAt: '08/08/2023',
};

const oAuth = `https://auth.mpdx.org/urlpath/to/authenicate`;
describe('EditGoogleAccountModal', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  let googleIntegration = { ...standardGoogleIntegration };

  beforeEach(() => {
    googleIntegration = { ...standardGoogleIntegration };
    handleClose.mockClear();
  });

  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText(/Edit Google Integration/i)).toBeInTheDocument();
    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should switch tabs', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText(/Edit Google Integration/i)).toBeInTheDocument();
    const setupTab = getByRole('tab', { name: /setup/i });
    expect(setupTab).toBeInTheDocument();
    userEvent.click(setupTab);

    const button = getByRole('link', { name: /refresh google account/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', oAuth);
  });

  it('should enable Calendar Integration', async () => {
    googleIntegration.calendarIntegration = false;
    googleIntegration.calendarIntegrations = [];
    googleIntegration.calendarName = null;
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );
    await waitFor(() =>
      expect(getByText(/Edit Google Integration/i)).toBeInTheDocument(),
    );

    userEvent.click(
      getByRole('button', { name: /enable calendar integration/i }),
    );
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Enabled Google Calendar Integration!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'UpdateGoogleIntegration',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        googleIntegration: {
          calendarIntegration: true,
          overwrite: true,
        },
        googleIntegrationId: googleIntegration.id,
      });
    });
  });

  it('should update Integrations calendar', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, findByRole, queryByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for MPDX to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByRole('button', { name: /update/i }));
    await waitFor(() =>
      expect(getByText(/this field is required/i)).toBeInTheDocument(),
    );
    userEvent.click(getByRole('combobox'));
    userEvent.click(
      await findByRole('option', {
        name: /calendarsName@cru\.org/i,
      }),
    );

    await waitFor(() =>
      expect(queryByRole(/this field is required/i)).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByRole('button', { name: /update/i })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: /update/i }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoogleIntegration', {
        input: {
          googleAccountId: googleAccount.id,
          googleIntegration: {
            calendarId: 'calendarsID',
            calendarIntegrations: [ActivityTypeEnum.AppointmentInPerson],
            overwrite: true,
          },
          googleIntegrationId: googleIntegration.id,
        },
      }),
    );

    expect(mockEnqueue).toHaveBeenCalledWith(
      'Updated Google Calendar Integration!',
      {
        variant: 'success',
      },
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it('should update calendar checkboxes', async () => {
    googleIntegration.calendarId = 'calendarsID';
    const mutationSpy = jest.fn();
    const { getByText, getByRole, getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for MPDX to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        getByTestId('Appointment - Video Call-Checkbox'),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByTestId('Appointment - Video Call-Checkbox'));
    userEvent.click(getByRole('button', { name: /update/i }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoogleIntegration', {
        input: {
          googleAccountId: googleAccount.id,
          googleIntegration: {
            calendarId: 'calendarsID',
            calendarIntegrations: [
              ActivityTypeEnum.AppointmentInPerson,
              ActivityTypeEnum.AppointmentVideoCall,
            ],
            overwrite: true,
          },
          googleIntegrationId: googleIntegration.id,
        },
      }),
    );

    expect(handleClose).toHaveBeenCalled();
    expect(mockEnqueue).toHaveBeenCalledWith(
      'Updated Google Calendar Integration!',
      {
        variant: 'success',
      },
    );
  });

  it('should delete Calendar Integration', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for MPDX to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    userEvent.click(
      getByRole('button', { name: /Disable Calendar Integration/i }),
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoogleIntegration', {
        input: {
          googleAccountId: googleAccount.id,
          googleIntegration: {
            calendarIntegration: false,
            overwrite: true,
          },
          googleIntegrationId: googleIntegration.id,
        },
      }),
    );

    expect(mockEnqueue).toHaveBeenCalledWith(
      'Disabled Google Calendar Integration!',
      {
        variant: 'success',
      },
    );
  });

  it('should create a  Calendar Integration', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() =>
      expect(getByText(/Enable Calendar Integration/i)).toBeInTheDocument(),
    );

    userEvent.click(
      getByRole('button', { name: /Enable Calendar Integration/i }),
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Enabled Google Calendar Integration!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'CreateGoogleIntegration',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        accountListId: accountListId,
        googleIntegration: {
          calendarIntegration: true,
        },
      });

      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'GoogleAccountIntegrations',
      );
    });
  });

  it('should sync Calendar Integration', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>
      </Components>,
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for MPDX to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByRole('button', { name: /sync calendar/i }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully Synced Calendar!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy).toHaveGraphqlOperation('SyncGoogleAccount', {
        input: {
          googleAccountId: googleAccount.id,
          integrationName: 'calendar',
          googleIntegrationId: googleIntegration.id,
        },
      });
    });
  });
});
