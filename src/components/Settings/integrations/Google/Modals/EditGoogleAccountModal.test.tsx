import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import * as Types from 'src/graphql/types.generated';
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
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const googleAccount = {
  email: 'test-n-rest@cru.org',
  primary: false,
  remoteId: '111222333444',
  id: 'abcd1234',
  tokenExpired: false,
};

const standardGoogleIntegration: Pick<
  Types.GoogleAccountIntegration,
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
    Types.Maybe<Pick<Types.GoogleAccountIntegrationCalendars, 'id' | 'name'>>
  >;
} = {
  calendarId: null,
  calendarIntegration: true,
  calendarIntegrations: ['Appointment'],
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
    const { getByText, getByRole, queryByRole } = render(
      <Components>
        <GqlMockedProvider<{
          LoadConstants: LoadConstantsQuery;
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
            LoadConstants: {
              constant: {
                activities: [
                  {
                    value: Types.ActivityTypeEnum.AppointmentVideoCall,
                    id: Types.ActivityTypeEnum.AppointmentVideoCall,
                  },
                  {
                    value: Types.ActivityTypeEnum.AppointmentInPerson,
                    id: Types.ActivityTypeEnum.AppointmentInPerson,
                  },
                  {
                    value: Types.ActivityTypeEnum.FollowUpEmail,
                    id: Types.ActivityTypeEnum.FollowUpEmail,
                  },
                ],
              },
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
        getByText(/choose a calendar for {{appName}} to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    await act(async () => {
      userEvent.click(getByRole('button', { name: /update/i }));
    });
    await waitFor(() =>
      expect(getByText(/this field is required/i)).toBeInTheDocument(),
    );
    await act(async () => {
      userEvent.click(getByRole('combobox'));
    });
    const calendarOption = getByRole('option', {
      name: /calendarsName@cru\.org/i,
    });
    await waitFor(() => expect(calendarOption).toBeInTheDocument());
    await act(async () => {
      userEvent.click(calendarOption);
    });

    await waitFor(() =>
      expect(queryByRole(/this field is required/i)).not.toBeInTheDocument(),
    );

    userEvent.click(getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Updated Google Calendar Integration!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'UpdateGoogleIntegration',
      );

      expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        googleIntegration: {
          calendarId: 'calendarsID',
          calendarIntegrations: ['Appointment'],
          overwrite: true,
        },
        googleIntegrationId: googleIntegration.id,
      });

      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('should update calendar checkboxes', async () => {
    googleIntegration.calendarId = 'calendarsID';
    const mutationSpy = jest.fn();
    const { getByText, getByRole, getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GoogleAccountIntegrations: GoogleAccountIntegrationsQuery;
          LoadConstants: LoadConstantsQuery;
        }>
          mocks={{
            GoogleAccountIntegrations: {
              googleAccountIntegrations: [googleIntegration],
            },
            LoadConstants: {
              constant: {
                activities: [
                  {
                    value: Types.ActivityTypeEnum.AppointmentVideoCall,
                    id: Types.ActivityTypeEnum.AppointmentVideoCall,
                  },
                  {
                    value: Types.ActivityTypeEnum.AppointmentInPerson,
                    id: Types.ActivityTypeEnum.AppointmentInPerson,
                  },
                  {
                    value: Types.ActivityTypeEnum.FollowUpEmail,
                    id: Types.ActivityTypeEnum.FollowUpEmail,
                  },
                ],
              },
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
        getByText(/choose a calendar for {{appName}} to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(
        getByTestId('APPOINTMENT_VIDEO_CALL-Checkbox'),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByTestId('APPOINTMENT_VIDEO_CALL-Checkbox'));
    userEvent.click(getByRole('button', { name: /update/i }));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Updated Google Calendar Integration!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'UpdateGoogleIntegration',
      );

      expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        googleIntegration: {
          calendarId: 'calendarsID',
          calendarIntegrations: ['Appointment', 'APPOINTMENT_VIDEO_CALL'],
          overwrite: true,
        },
        googleIntegrationId: googleIntegration.id,
      });

      expect(handleClose).toHaveBeenCalled();
    });
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
        getByText(/choose a calendar for {{appName}} to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    userEvent.click(
      getByRole('button', { name: /Disable Calendar Integration/i }),
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Disabled Google Calendar Integration!',
        {
          variant: 'success',
        },
      );
      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'UpdateGoogleIntegration',
      );
      expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        googleIntegration: {
          calendarIntegration: false,
          overwrite: true,
        },
        googleIntegrationId: googleIntegration.id,
      });
    });
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
        getByText(/choose a calendar for {{appName}} to push tasks to:/i),
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
      expect(mutationSpy.mock.calls[2][0].operation.operationName).toEqual(
        'SyncGoogleAccount',
      );
      expect(mutationSpy.mock.calls[2][0].operation.variables.input).toEqual({
        googleAccountId: googleAccount.id,
        integrationName: 'calendar',
        googleIntegrationId: googleIntegration.id,
      });
    });
  });
});
