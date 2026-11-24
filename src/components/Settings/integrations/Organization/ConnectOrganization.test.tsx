import { PropsWithChildren } from 'react';
import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError, buildASTSchema } from 'graphql';
import MockLink from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import schema from 'src/graphql/schema.graphql';
import * as Types from 'src/graphql/types.generated';
import { signOutAndClear } from 'src/lib/clearSessionData';
import theme from 'src/theme';
import { ConnectOrganization } from './ConnectOrganization';
import { GetOrganizationsQuery } from './Organizations.generated';

jest.mock('src/lib/clearSessionData');

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

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const GetOrganizationsMock: Pick<
  Types.Organization,
  'apiClass' | 'id' | 'name' | 'oauth' | 'giftAidPercentage' | 'disableNewUsers'
>[] = [
  {
    id: 'organizationId',
    name: 'organizationName',
    apiClass: 'OfflineOrg',
    oauth: false,
    giftAidPercentage: 0,
    disableNewUsers: false,
  },
  {
    id: 'ministryId',
    name: 'ministryName',
    apiClass: 'Siebel',
    oauth: false,
    giftAidPercentage: 80,
    disableNewUsers: false,
  },
  {
    id: 'loginId',
    name: 'loginName',
    apiClass: 'DataServer',
    oauth: false,
    giftAidPercentage: 70,
    disableNewUsers: false,
  },
  {
    id: 'oAuthId',
    name: 'oAuthName',
    apiClass: 'DataServer',
    oauth: true,
    giftAidPercentage: 60,
    disableNewUsers: false,
  },
  {
    id: 'disableNewUserOrgId',
    name: 'Not Allowed Org Name',
    apiClass: 'DataServer',
    oauth: false,
    giftAidPercentage: 60,
    disableNewUsers: true,
  },
  {
    id: 'disableNewUserAsNull',
    name: 'Org With DisableNewUsers As NULL',
    apiClass: 'OfflineOrg',
    oauth: false,
    giftAidPercentage: 60,
    disableNewUsers: null,
  },
  {
    id: 'netsuiteId',
    name: 'netsuiteName',
    apiClass: 'Remote::Import::OrganizationAccountService',
    oauth: false,
    giftAidPercentage: 0,
    disableNewUsers: false,
  },
];

const NO_ACCESS_TEXT =
  "We checked and you don't have access to this organization yet.";
const CHECK_FAILED_TEXT =
  "We couldn't finish checking your access because of a problem on our end. Please press Connect again later.";

const standardMocks = {
  GetOrganizations: {
    organizations: GetOrganizationsMock,
  },
};

const onDone = jest.fn();

describe('Connect Organization', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  let mocks = { ...standardMocks };

  beforeEach(() => {
    onDone.mockClear();
    mocks = { ...standardMocks };
  });
  it('should render and not show disabled Orgs', async () => {
    const { getByText, getByRole, queryByRole } = render(
      <Components>
        <GqlMockedProvider>
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(
        queryByRole('option', { name: 'Not Allowed Org Name' }),
      ).not.toBeInTheDocument(),
    );

    userEvent.click(getByText(/cancel/i));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('should select offline Organization and add it', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, findByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'organizationName' }));

    await waitFor(() => {
      expect(getByText('Add Account')).not.toBeDisabled();
      userEvent.click(getByText('Add Account'));
    });
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX added your organization account',
        { variant: 'success' },
      );
      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'CreateOrganizationAccount',
      );

      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        attributes: {
          organizationId: mocks.GetOrganizations.organizations[0].id,
        },
      });
    });
  });

  it('should not call onDone when adding the account fails', async () => {
    const { getByText, getByRole, findByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
            CreateOrganizationAccount: () => {
              throw new Error('Server Error');
            },
          }}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'organizationName' }));

    await waitFor(() => {
      expect(getByText('Add Account')).not.toBeDisabled();
      userEvent.click(getByText('Add Account'));
    });

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Invalid username or password.',
        { variant: 'error' },
      ),
    );
    expect(onDone).not.toHaveBeenCalled();
  });

  it('allows offline Organization to be added if disableNewUsers is null', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, findByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(
      await findByRole('option', { name: 'Org With DisableNewUsers As NULL' }),
    );

    await waitFor(() => {
      expect(getByText('Add Account')).not.toBeDisabled();
      userEvent.click(getByText('Add Account'));
    });
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX added your organization account',
        { variant: 'success' },
      );
    });
  });

  it('should select Ministry Organization and be unable to add it.', async () => {
    const mutationSpy = jest.fn();
    const { findByText, getByText, findByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'netsuiteName' }));

    expect(
      await findByText('You must log into MPDX with your ministry email'),
    ).toBeInTheDocument();
    expect(getByText('Add Account')).toBeDisabled();
    expect(
      getByRole('link', {
        name: /contact your donation services team to request access\./i,
      }),
    ).toBeInTheDocument();
  });

  it('clears session data before signing out from the ministry warning', async () => {
    const { findByText, findByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'ministryName' }));
    userEvent.click(await findByText(/click here to log out of/i));

    await waitFor(() =>
      expect(signOutAndClear).toHaveBeenCalledWith(expect.any(ApolloClient), {
        callbackUrl: 'signOut',
      }),
    );
  });

  it('should select Login Organization and add it.', async () => {
    const mutationSpy = jest.fn();
    const { findByText, getByText, findByRole, getByRole, getByTestId } =
      render(
        <Components>
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
          }>
            mocks={{
              GetOrganizations: {
                organizations: GetOrganizationsMock,
              },
            }}
            onCall={mutationSpy}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'loginName' }));

    expect(await findByText('Username')).toBeInTheDocument();
    expect(getByText('Password')).toBeInTheDocument();
    expect(getByText('Add Account')).toBeDisabled();

    userEvent.type(
      getByRole('textbox', {
        name: /username/i,
      }),
      'MyUsername',
    );
    expect(await findByText('Add Account')).toBeDisabled();
    userEvent.type(getByTestId('passwordInput'), 'MyPassword');

    await waitFor(() => expect(getByText('Add Account')).not.toBeDisabled());
    userEvent.click(getByText('Add Account'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'MPDX added your organization account',
        { variant: 'success' },
      );
      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'CreateOrganizationAccount',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        attributes: {
          organizationId: mocks.GetOrganizations.organizations[2].id,
          username: 'MyUsername',
          password: 'MyPassword',
        },
      });
    });
  });

  it('should select OAuth Organization and add it.', async () => {
    const mutationSpy = jest.fn();
    const { findByText, getByText, findByRole, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            GetOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <ConnectOrganization onDone={onDone} />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(await findByRole('option', { name: 'oAuthName' }));

    expect(
      await findByText(
        "You will be taken to your organization's donation services system to grant MPDX permission to access your donation data.",
      ),
    ).toBeInTheDocument();
    expect(getByText('Connect')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Connect')).not.toBeDisabled();
    });

    userEvent.click(getByText('Connect'));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Redirecting you to complete authentication to connect.',
        { variant: 'success' },
      );
    });
  });

  describe('Cru USA access check', () => {
    const accessError = (code?: string) => ({
      createOrganizationAccount: (() => {
        throw new GraphQLError('Raw API message', {
          extensions: code ? { code } : {},
        });
      }) as never,
    });

    const pickMinistry = async (
      utils: ReturnType<typeof render>,
      name = 'ministryName',
    ) => {
      userEvent.click(utils.getByRole('combobox'));
      userEvent.click(await utils.findByRole('option', { name }));
    };

    const createCalls = (spy: jest.Mock) =>
      spy.mock.calls.filter(
        ([{ operation }]) =>
          operation.operationName === 'CreateOrganizationAccount',
      );

    it('ignores a second press while the request is still running', async () => {
      const mutationSpy = jest.fn();
      let finish: () => void = () => {};
      const held = new Promise<void>((resolve) => {
        finish = resolve;
      });
      const utils = render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
              CreateOrganizationAccount: {
                createOrganizationAccount: (async () => {
                  await held;
                  return { organizationAccount: { id: 'account-1' } };
                }) as never,
              },
            }}
            onCall={mutationSpy}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );
      await pickMinistry(utils);

      const button = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(button).toBeEnabled());
      userEvent.click(button);
      await waitFor(() => expect(button).toBeDisabled());
      userEvent.click(button, undefined, { skipPointerEventsCheck: true });
      userEvent.click(button, undefined, { skipPointerEventsCheck: true });

      finish();
      await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
      expect(createCalls(mutationSpy)).toHaveLength(1);
    });

    it('shows the check-failed message when the network fails', async () => {
      const failingLink = ApolloLink.from([
        new ApolloLink((operation, forward) =>
          operation.operationName === 'CreateOrganizationAccount'
            ? new Observable((observer) => {
                observer.error(new Error('Failed to fetch'));
              })
            : forward(operation),
        ),
        new MockLink(
          buildASTSchema(schema),
          { GetOrganizations: { organizations: GetOrganizationsMock } },
          { addTypename: true },
        ),
      ]);
      const utils = render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
            }}
            link={failingLink}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );
      await pickMinistry(utils);
      userEvent.click(document.body);
      const button = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(button).toBeEnabled());
      userEvent.click(button);

      expect(await utils.findByRole('alert')).toHaveTextContent(
        CHECK_FAILED_TEXT,
      );
      expect(utils.queryByText(NO_ACCESS_TEXT, { exact: false })).toBeNull();
      expect(onDone).not.toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        'Invalid username or password.',
        expect.anything(),
      );
    });

    it('suppresses the two access codes in the global error handler for Cru USA only', async () => {
      const mutationSpy = jest.fn();
      const utils = render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
            }}
            onCall={mutationSpy}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );

      await pickMinistry(utils);
      userEvent.click(document.body);
      const connect = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(connect).toBeEnabled());
      userEvent.click(connect);
      await waitFor(() => expect(createCalls(mutationSpy)).toHaveLength(1));
      expect(
        createCalls(mutationSpy)[0][0].operation.getContext()
          .suppressErrorCodes,
      ).toEqual(['NO_MINISTRY_ACCESS', 'ACCESS_CHECK_FAILED']);
    });

    it('does not suppress error codes for other organizations', async () => {
      const mutationSpy = jest.fn();
      const utils = render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
            }}
            onCall={mutationSpy}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );

      await pickMinistry(utils, 'organizationName');
      userEvent.click(document.body);
      const add = await utils.findByRole('button', { name: 'Add Account' });
      await waitFor(() => expect(add).toBeEnabled());
      userEvent.click(add);
      await waitFor(() => expect(createCalls(mutationSpy)).toHaveLength(1));
      expect(
        createCalls(mutationSpy)[0][0].operation.getContext()
          .suppressErrorCodes,
      ).toBeUndefined();
    });

    it('removes the message when the field is cleared', async () => {
      const utils = render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
              CreateOrganizationAccount: accessError('NO_MINISTRY_ACCESS'),
            }}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );
      await pickMinistry(utils);
      userEvent.click(document.body);
      const button = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(button).toBeEnabled());
      userEvent.click(button);
      await utils.findByRole('alert');

      const field = utils.getByRole('combobox');
      userEvent.clear(field);
      await waitFor(() =>
        expect(utils.queryByRole('alert')).not.toBeInTheDocument(),
      );
      expect(
        utils.queryByText(NO_ACCESS_TEXT, { exact: false }),
      ).not.toBeInTheDocument();

      // The old message must not come back when Cru USA is picked again.
      userEvent.type(field, '{arrowdown}');
      userEvent.click(
        await utils.findByRole('option', { name: 'ministryName' }),
      );
      expect(
        await utils.findByText(
          "If you are already logged in with your ministry email, press Connect and we'll check your access.",
        ),
      ).toBeInTheDocument();
      expect(utils.queryByRole('alert')).not.toBeInTheDocument();
    });

    const renderWithCreateMock = (
      createMock?: ReturnType<typeof accessError>,
      mutationSpy?: jest.Mock,
    ) =>
      render(
        <Components>
          <GqlMockedProvider<{ GetOrganizations: GetOrganizationsQuery }>
            mocks={{
              GetOrganizations: { organizations: GetOrganizationsMock },
              ...(createMock ? { CreateOrganizationAccount: createMock } : {}),
            }}
            onCall={mutationSpy}
          >
            <ConnectOrganization onDone={onDone} />
          </GqlMockedProvider>
        </Components>,
      );

    const pressConnect = async (utils: ReturnType<typeof render>) => {
      userEvent.click(document.body);
      const button = await utils.findByRole('button', { name: 'Connect' });
      await waitFor(() => expect(button).toBeEnabled());
      userEvent.click(button);
      return button;
    };

    it('shows the no-access message with the Donation Services link for NO_MINISTRY_ACCESS', async () => {
      const utils = renderWithCreateMock(accessError('NO_MINISTRY_ACCESS'));
      await pickMinistry(utils);
      const button = await pressConnect(utils);

      const alert = await utils.findByRole('alert');
      expect(alert).toHaveTextContent(
        "We checked and you don't have access to this organization yet. Ask your donation services team for access. Once they've given it, come back and press Connect again.",
      );
      const link = utils.getByRole('link', {
        name: 'Ask your donation services team for access.',
      });
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining(
          '?subject=Request+access+to+ministry+organization&body=',
        ),
      );
      expect(link.getAttribute('href')).toMatch(/^mailto:/);
      expect(utils.queryByText(CHECK_FAILED_TEXT)).toBeNull();
      await waitFor(() => expect(button).toBeEnabled());
      expect(onDone).not.toHaveBeenCalled();
      expect(mockEnqueue).not.toHaveBeenCalledWith(
        'Invalid username or password.',
        expect.anything(),
      );
    });

    it.each([
      ['ACCESS_CHECK_FAILED', 'ACCESS_CHECK_FAILED'],
      ['a GraphQL error with no code', undefined],
    ])(
      'shows the check-failed message and never the no-access one for %s',
      async (_label, code) => {
        const utils = renderWithCreateMock(accessError(code));
        await pickMinistry(utils);
        const button = await pressConnect(utils);

        expect(await utils.findByRole('alert')).toHaveTextContent(
          CHECK_FAILED_TEXT,
        );
        expect(utils.queryByText(NO_ACCESS_TEXT, { exact: false })).toBeNull();
        expect(
          utils.queryByRole('link', {
            name: 'Ask your donation services team for access.',
          }),
        ).toBeNull();
        await waitFor(() => expect(button).toBeEnabled());
        expect(onDone).not.toHaveBeenCalled();
        expect(mockEnqueue).not.toHaveBeenCalledWith(
          'Invalid username or password.',
          expect.anything(),
        );
      },
    );

    it('does not send credentials typed for a login organization after switching to Cru USA', async () => {
      const mutationSpy = jest.fn();
      const utils = renderWithCreateMock(undefined, mutationSpy);

      await pickMinistry(utils, 'loginName');
      userEvent.type(
        await utils.findByRole('textbox', { name: /username/i }),
        'MyUsername',
      );
      userEvent.type(utils.getByTestId('passwordInput'), 'MyPassword');

      const field = utils.getByRole('combobox');
      userEvent.clear(field);
      userEvent.type(field, '{arrowdown}');
      userEvent.click(
        await utils.findByRole('option', { name: 'ministryName' }),
      );
      await pressConnect(utils);

      await waitFor(() => expect(createCalls(mutationSpy)).toHaveLength(1));
      expect(createCalls(mutationSpy)[0][0].operation.variables.input).toEqual({
        attributes: { organizationId: 'ministryId' },
      });
      await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    });

    it('clears typed credentials when a different organization is picked', async () => {
      const utils = renderWithCreateMock();

      await pickMinistry(utils, 'loginName');
      userEvent.type(
        await utils.findByRole('textbox', { name: /username/i }),
        'MyUsername',
      );
      userEvent.type(utils.getByTestId('passwordInput'), 'MyPassword');

      const field = utils.getByRole('combobox');
      userEvent.clear(field);
      userEvent.type(field, '{arrowdown}');
      userEvent.click(
        await utils.findByRole('option', { name: 'organizationName' }),
      );
      userEvent.clear(field);
      userEvent.type(field, '{arrowdown}');
      userEvent.click(await utils.findByRole('option', { name: 'loginName' }));

      expect(
        await utils.findByRole('textbox', { name: /username/i }),
      ).toHaveValue('');
      expect(utils.getByTestId('passwordInput')).toHaveValue('');
    });
  });
});
