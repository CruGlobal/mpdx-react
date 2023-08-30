import { render, waitFor, act } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations.page';
import { EditGoogleAccountModal } from './EditGoogleAccountModal';
import { getSession } from 'next-auth/react';
import * as Types from '../../../../../../graphql/types.generated';
import {
  GetGoogleAccountIntegrationsQuery,
  GetIntegrationActivitiesQuery,
} from './googleIntegrations.generated';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const apiToken = 'apiToken';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};
const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
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

const Components = (children: React.ReactElement) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>
        <IntegrationsContextProvider apiToken={apiToken}>
          {children}
        </IntegrationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const googleAccount = {
  email: 'test-n-rest@cru.org',
  primary: false,
  remoteId: '111222333444',
  id: 'abcd1234',
  tokenExpired: false,
  __typename: 'GoogleAccountAttributes',
};

const standardGoogleIntegration: Pick<
  Types.GoogleAccountIntegration,
  | '__typename'
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
    Types.Maybe<
      { __typename?: 'GoogleAccountIntegrationCalendars' } & Pick<
        Types.GoogleAccountIntegrationCalendars,
        'id' | 'name'
      >
    >
  >;
} = {
  __typename: 'GoogleAccountIntegration',
  calendarId: null,
  calendarIntegration: true,
  calendarIntegrations: ['Appointment'],
  calendarName: 'calendar',
  calendars: [
    {
      __typename: 'GoogleAccountIntegrationCalendars',
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
  (getSession as jest.Mock).mockResolvedValue(session);
  let googleIntegration = { ...standardGoogleIntegration };

  beforeEach(() => {
    googleIntegration = { ...standardGoogleIntegration };
    handleClose.mockClear();
  });

  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      Components(
        <GqlMockedProvider>
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>,
      ),
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
      Components(
        <GqlMockedProvider onCall={mutationSpy}>
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>,
      ),
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
      Components(
        <GqlMockedProvider
          mocks={{
            GetGoogleAccountIntegrations: {
              getGoogleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>,
      ),
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
      Components(
        <GqlMockedProvider<{
          GetIntegrationActivities: GetIntegrationActivitiesQuery;
          GetGoogleAccountIntegrations: GetGoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GetGoogleAccountIntegrations: {
              getGoogleAccountIntegrations: [googleIntegration],
            },
            GetIntegrationActivities: {
              constant: {
                activities: [
                  {
                    id: 'Call',
                    value: 'Call',
                    __typename: 'IdValue',
                  },
                  {
                    id: 'Appointment',
                    value: 'Appointment',
                    __typename: 'IdValue',
                  },
                  {
                    id: 'Email',
                    value: 'Email',
                    __typename: 'IdValue',
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
        </GqlMockedProvider>,
      ),
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for mpdx to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    await act(async () => {
      userEvent.click(getByRole('button', { name: /update/i }));
    });
    await waitFor(() =>
      expect(getByText(/this field is required/i)).toBeInTheDocument(),
    );
    await act(async () => {
      userEvent.click(getByRole('button', { name: /​/i }));
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
    let getByText, getByRole, getByTestId;
    await act(async () => {
      const {
        getByText: getByTextFromRender,
        getByRole: getByRoleFromRender,
        getByTestId: getByTestIdFromRender,
      } = render(
        Components(
          <GqlMockedProvider<{
            GetGoogleAccountIntegrations: GetGoogleAccountIntegrationsQuery;
            GetIntegrationActivities: GetIntegrationActivitiesQuery;
          }>
            mocks={{
              GetGoogleAccountIntegrations: {
                getGoogleAccountIntegrations: [googleIntegration],
              },
              GetIntegrationActivities: {
                constant: {
                  activities: [
                    {
                      id: 'Call',
                      value: 'Call',
                      __typename: 'IdValue',
                    },
                    {
                      id: 'Appointment',
                      value: 'Appointment',
                      __typename: 'IdValue',
                    },
                    {
                      id: 'Email',
                      value: 'Email',
                      __typename: 'IdValue',
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
          </GqlMockedProvider>,
        ),
      );

      getByText = getByTextFromRender;
      getByRole = getByRoleFromRender;
      getByTestId = getByTestIdFromRender;
    });

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for mpdx to push tasks to:/i),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByTestId('Call-Checkbox'));
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
          calendarIntegrations: ['Appointment', 'Call'],
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
      Components(
        <GqlMockedProvider<{
          GetGoogleAccountIntegrations: GetGoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GetGoogleAccountIntegrations: {
              getGoogleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>,
      ),
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for mpdx to push tasks to:/i),
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

  it('should sync Calendar Integration', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      Components(
        <GqlMockedProvider<{
          GetGoogleAccountIntegrations: GetGoogleAccountIntegrationsQuery;
        }>
          mocks={{
            GetGoogleAccountIntegrations: {
              getGoogleAccountIntegrations: [googleIntegration],
            },
          }}
          onCall={mutationSpy}
        >
          <EditGoogleAccountModal
            account={googleAccount}
            handleClose={handleClose}
            oAuth={oAuth}
          />
        </GqlMockedProvider>,
      ),
    );

    await waitFor(() =>
      expect(
        getByText(/choose a calendar for mpdx to push tasks to:/i),
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
