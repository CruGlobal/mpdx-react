import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ConnectOrganization } from 'src/components/Settings/integrations/Organization/ConnectOrganization';
import {
  GetOrganizationsQuery,
  GetUsersOrganizationsAccountsQuery,
} from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { Connect } from 'src/components/Setup/Connect';
import { useNextSetupPage } from 'src/components/Setup/useNextSetupPage';
import theme from 'src/theme';

jest.mock('src/lib/clearSessionData');
jest.mock('src/components/Setup/useNextSetupPage');
(useNextSetupPage as jest.MockedFn<typeof useNextSetupPage>).mockReturnValue({
  next: jest.fn(),
});

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const DONATION_SERVICES_EMAIL = 'donation-services@example.org';
process.env.DONATION_SERVICES_EMAIL = DONATION_SERVICES_EMAIL;

const CRU_USA = 'Cru USA';
const NETSUITE = 'Cru International Org';

const organization = (
  id: string,
  name: string,
  apiClass: string,
  oauth = false,
) => ({
  id,
  name,
  apiClass,
  oauth,
  giftAidPercentage: 0,
  disableNewUsers: false,
});

const organizations = [
  organization('cru-usa-id', CRU_USA, 'Siebel'),
  organization(
    'netsuite-id',
    NETSUITE,
    'Remote::Import::OrganizationAccountService',
  ),
  organization('offline-id', 'Offline Org', 'OfflineOrg'),
  organization('login-id', 'Login Org', 'DataServer'),
  organization('oauth-id', 'OAuth Org', 'DataServer', true),
];

const NO_ACCESS_TEXT =
  "We checked and you don't have access to this organization yet. Ask your donation services team for access. Once they've given it, come back and press Connect again.";
const CHECK_FAILED_TEXT =
  "We couldn't finish checking your access because of a problem on our end. Please press Connect again later.";
const BEFORE_PRESS_TEXT =
  "If you are already logged in with your ministry email, press Connect and we'll check your access.";
const DONATION_SERVICES_LINK = /ask your donation services team for access/i;
const RAW_API_TEXT = 'API message the user should not see';

const throwing = (error: GraphQLError) => ({
  createOrganizationAccount: (() => {
    throw error;
  }) as never,
});

const accessError = (code: string) =>
  throwing(new GraphQLError(RAW_API_TEXT, { extensions: { code } }));

type CreateMock = ReturnType<typeof throwing> | undefined;

interface RenderOptions {
  create?: CreateMock;
  orgs?: ReturnType<typeof organization>[];
}

const Wrapper = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={{ query: {}, isReady: true }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const onDone = jest.fn();
const mutationSpy = jest.fn();

const renderSettings = ({ create, orgs = organizations }: RenderOptions = {}) =>
  render(
    <Wrapper>
      <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
        mocks={{
          GetOrganizations: { organizations: orgs },
          ...(create ? { CreateOrganizationAccount: create } : {}),
        }}
        onCall={mutationSpy}
      >
        <ConnectOrganization onDone={onDone} />
      </GqlMockedProvider>
    </Wrapper>,
  );

const renderSetup = ({ create }: RenderOptions = {}) =>
  render(
    <Wrapper>
      <GqlMockedProvider<{
        GetUsersOrganizationsAccounts: GetUsersOrganizationsAccountsQuery;
        GetOrganizations: GetOrganizationsQuery;
      }>
        mocks={{
          GetUsersOrganizationsAccounts: { userOrganizationAccounts: [] },
          GetOrganizations: { organizations },
          ...(create ? { CreateOrganizationAccount: create } : {}),
        }}
        onCall={mutationSpy}
      >
        <Connect />
      </GqlMockedProvider>
    </Wrapper>,
  );

type Rendered = ReturnType<typeof render>;

const pick = async (
  { findByRole, getByRole }: Rendered,
  organizationName: string,
) => {
  userEvent.click(await findByRole('combobox', { name: 'Organization' }));
  userEvent.click(await findByRole('option', { name: organizationName }));
  expect(getByRole('combobox', { name: 'Organization' })).toHaveValue(
    organizationName,
  );
};

// Leaving the organization field briefly disables the submit button, so a click
// made while focus is still in the field is lost. Leave the field, wait for the
// button to be enabled, then click exactly once.
const press = async ({ findByRole }: Rendered, name: string) => {
  userEvent.click(document.body);
  const button = await findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  userEvent.click(button);
};

const pressConnect = (utils: Rendered) => press(utils, 'Connect');

const createCalls = () =>
  mutationSpy.mock.calls.filter(
    ([{ operation }]) =>
      operation.operationName === 'CreateOrganizationAccount',
  );

const expectNoRawApiText = ({ queryByText }: Rendered) => {
  expect(queryByText(RAW_API_TEXT, { exact: false })).not.toBeInTheDocument();
  expect(mockEnqueue).not.toHaveBeenCalledWith(RAW_API_TEXT, expect.anything());
};

const expectNoInvalidCredentialsToast = () =>
  expect(mockEnqueue).not.toHaveBeenCalledWith(
    'Invalid username or password.',
    expect.anything(),
  );

beforeEach(() => {
  mockEnqueue.mockClear();
  mutationSpy.mockClear();
  onDone.mockClear();
});

describe('MPDX-10396 Connect Cru USA from Add Organization', () => {
  describe('before pressing Connect', () => {
    it('AC1: shows the ministry email guidance and the new line, without the old request-access text', async () => {
      const utils = renderSettings();
      await pick(utils, CRU_USA);

      expect(
        utils.getByText('You must log into MPDX with your ministry email'),
      ).toBeInTheDocument();
      expect(
        utils.getByText(
          /This organization requires you to log into MPDX with your ministry email/,
        ),
      ).toBeInTheDocument();
      expect(
        utils.getByText('Click here to log out of MPDX'),
      ).toBeInTheDocument();
      expect(utils.getByText(BEFORE_PRESS_TEXT)).toBeInTheDocument();
      expect(utils.queryByText(/24 hours/)).not.toBeInTheDocument();
      expect(
        utils.queryByText(
          /you'll need to contact your donation services team/i,
        ),
      ).not.toBeInTheDocument();
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('AC2: the submit button reads Connect and is enabled', async () => {
      const utils = renderSettings();
      await pick(utils, CRU_USA);

      const button = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(button).toBeEnabled());
      expect(
        utils.queryByRole('button', { name: 'Add Account' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('pressing Connect', () => {
    it('AC3: sends CreateOrganizationAccount once with only the Cru USA id', async () => {
      const utils = renderSettings();
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      await waitFor(() => expect(createCalls()).toHaveLength(1));
      expect(createCalls()[0][0].operation.variables).toEqual({
        input: { attributes: { organizationId: 'cru-usa-id' } },
      });
    });

    it('AC2, AC3: Cru USA is the Siebel org, whatever its name or id', async () => {
      const utils = renderSettings({
        orgs: [
          organization('another-siebel-id', 'US Staff Giving', 'Siebel'),
          organization('offline-id', 'Offline Org', 'OfflineOrg'),
        ],
      });
      await pick(utils, 'US Staff Giving');
      expect(utils.getByText(BEFORE_PRESS_TEXT)).toBeInTheDocument();
      await pressConnect(utils);

      await waitFor(() => expect(createCalls()).toHaveLength(1));
      expect(createCalls()[0][0].operation.variables).toEqual({
        input: { attributes: { organizationId: 'another-siebel-id' } },
      });
    });

    it('AC4: on success shows the added message and calls onDone', async () => {
      const utils = renderSettings();
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX added your organization account',
          { variant: 'success' },
        ),
      );
      expect(onDone).toHaveBeenCalledTimes(1);
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('AC5, AC8, AC9: NO_MINISTRY_ACCESS shows the approved message with the Donation Services mailto link', async () => {
      const utils = renderSettings({
        create: accessError('NO_MINISTRY_ACCESS'),
      });
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      const alert = await utils.findByRole('alert');
      expect(alert).toHaveTextContent(NO_ACCESS_TEXT);

      const link = utils.getByRole('link', { name: DONATION_SERVICES_LINK });
      const href = link.getAttribute('href') ?? '';
      expect(href.startsWith(`mailto:${DONATION_SERVICES_EMAIL}?`)).toBe(true);
      expect(href).toContain('subject=Request+access+to+ministry+organization');
      expect(href).toContain(
        encodeURIComponent(`Organization name: ${CRU_USA}`),
      );

      expect(onDone).not.toHaveBeenCalled();
      expectNoInvalidCredentialsToast();
      expectNoRawApiText(utils);
      expect(utils.queryByText(CHECK_FAILED_TEXT)).not.toBeInTheDocument();
      expect(utils.getByRole('button', { name: 'Connect' })).toBeEnabled();
    });

    it('AC5: after NO_MINISTRY_ACCESS the user can press Connect again', async () => {
      const utils = renderSettings({
        create: accessError('NO_MINISTRY_ACCESS'),
      });
      await pick(utils, CRU_USA);
      await pressConnect(utils);
      await utils.findByRole('alert');

      await pressConnect(utils);
      await waitFor(() => expect(createCalls()).toHaveLength(2));
    });

    it('AC6, AC8, AC9: ACCESS_CHECK_FAILED shows the check-failed message and never the no-access message', async () => {
      const utils = renderSettings({
        create: accessError('ACCESS_CHECK_FAILED'),
      });
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      const alert = await utils.findByRole('alert');
      expect(alert).toHaveTextContent(CHECK_FAILED_TEXT);
      expect(alert).not.toHaveTextContent(/don't have access/i);
      expect(
        utils.queryByRole('link', { name: DONATION_SERVICES_LINK }),
      ).not.toBeInTheDocument();

      expect(onDone).not.toHaveBeenCalled();
      expectNoInvalidCredentialsToast();
      expectNoRawApiText(utils);
      expect(utils.getByRole('button', { name: 'Connect' })).toBeEnabled();
    });

    it('AC7, AC8: any other failure shows the check-failed message', async () => {
      const utils = renderSettings({
        create: throwing(new GraphQLError('Something else broke')),
      });
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      const alert = await utils.findByRole('alert');
      expect(alert).toHaveTextContent(CHECK_FAILED_TEXT);
      expect(utils.queryByText(/don't have access/i)).not.toBeInTheDocument();
      expect(onDone).not.toHaveBeenCalled();
      expectNoInvalidCredentialsToast();
    });

    it.each(['NO_MINISTRY_ACCESS', 'ACCESS_CHECK_FAILED'])(
      'AC10: picking another organization removes the message after %s',
      async (code) => {
        const utils = renderSettings({ create: accessError(code) });
        await pick(utils, CRU_USA);
        await pressConnect(utils);
        await utils.findByRole('alert');

        await pick(utils, 'Offline Org');
        await waitFor(() =>
          expect(utils.queryByRole('alert')).not.toBeInTheDocument(),
        );
        expect(utils.queryByText(NO_ACCESS_TEXT)).not.toBeInTheDocument();
        expect(utils.queryByText(CHECK_FAILED_TEXT)).not.toBeInTheDocument();
      },
    );
  });

  describe('other organizations', () => {
    it('AC11: a NetSuite ministry org keeps the current behavior', async () => {
      const utils = renderSettings();
      await pick(utils, NETSUITE);

      expect(
        utils.getByText('You must log into MPDX with your ministry email'),
      ).toBeInTheDocument();
      expect(utils.getByText(/wait 24 hours/)).toBeInTheDocument();
      expect(
        utils.getByRole('link', {
          name: /contact your donation services team to request access/i,
        }),
      ).toBeInTheDocument();
      expect(utils.queryByText(BEFORE_PRESS_TEXT)).not.toBeInTheDocument();
      expect(utils.getByRole('button', { name: 'Add Account' })).toBeDisabled();
      expect(
        utils.queryByRole('button', { name: 'Connect' }),
      ).not.toBeInTheDocument();
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('AC12: an offline org still adds with Add Account', async () => {
      const utils = renderSettings();
      await pick(utils, 'Offline Org');

      await press(utils, 'Add Account');
      await waitFor(() => expect(createCalls()).toHaveLength(1));
      expect(createCalls()[0][0].operation.variables).toEqual({
        input: { attributes: { organizationId: 'offline-id' } },
      });
      expect(utils.queryByText(BEFORE_PRESS_TEXT)).not.toBeInTheDocument();
    });

    it('AC12: a login org still asks for a username and password', async () => {
      const utils = renderSettings();
      await pick(utils, 'Login Org');

      expect(utils.getByLabelText(/username/i)).toBeInTheDocument();
      expect(utils.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        utils.getByRole('button', { name: 'Add Account' }),
      ).toBeInTheDocument();
    });

    it('AC12: a login org failure still says invalid username or password, even with a Cru USA code', async () => {
      const utils = renderSettings({
        create: accessError('NO_MINISTRY_ACCESS'),
      });
      await pick(utils, 'Login Org');
      userEvent.type(utils.getByLabelText(/username/i), 'user');
      userEvent.type(utils.getByLabelText(/password/i), 'secret');

      await press(utils, 'Add Account');
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Invalid username or password.',
          { variant: 'error' },
        ),
      );
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
      expect(utils.queryByText(/don't have access/i)).not.toBeInTheDocument();
      expect(onDone).not.toHaveBeenCalled();
    });

    it('AC12: an OAuth org still shows Connect and its own notice', async () => {
      const utils = renderSettings();
      await pick(utils, 'OAuth Org');

      expect(
        utils.getByText(
          /to grant MPDX permission to access your donation data/,
        ),
      ).toBeInTheDocument();
      expect(
        utils.getByRole('button', { name: 'Connect' }),
      ).toBeInTheDocument();
      expect(utils.queryByText(BEFORE_PRESS_TEXT)).not.toBeInTheDocument();
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('AC13: the Setup flow Connect step', () => {
    it('shows the Cru USA panel, connects, and reloads the organization list', async () => {
      const utils = renderSetup();
      await pick(utils, CRU_USA);
      expect(utils.getByText(BEFORE_PRESS_TEXT)).toBeInTheDocument();
      expect(utils.queryByText(/24 hours/)).not.toBeInTheDocument();
      mutationSpy.mockClear();
      await pressConnect(utils);

      await waitFor(() => expect(createCalls()).toHaveLength(1));
      expect(createCalls()[0][0].operation.variables).toEqual({
        input: { attributes: { organizationId: 'cru-usa-id' } },
      });
      await waitFor(() =>
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX added your organization account',
          { variant: 'success' },
        ),
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'GetUsersOrganizationsAccounts',
        ),
      );
    });

    it('shows the no-access message', async () => {
      const utils = renderSetup({ create: accessError('NO_MINISTRY_ACCESS') });
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      expect(await utils.findByRole('alert')).toHaveTextContent(NO_ACCESS_TEXT);
      expectNoRawApiText(utils);
    });

    it('shows the check-failed message', async () => {
      const utils = renderSetup({ create: accessError('ACCESS_CHECK_FAILED') });
      await pick(utils, CRU_USA);
      await pressConnect(utils);

      expect(await utils.findByRole('alert')).toHaveTextContent(
        CHECK_FAILED_TEXT,
      );
      expectNoRawApiText(utils);
    });
  });
});
