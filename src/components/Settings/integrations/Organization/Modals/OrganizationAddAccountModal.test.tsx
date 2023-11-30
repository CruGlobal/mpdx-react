import { PropsWithChildren } from 'react';
import { render, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import theme from 'src/theme';
import * as Types from '../../../../../../graphql/types.generated';
import { OrganizationAddAccountModal } from './OrganizationAddAccountModal';
import { GetOrganizationsQuery } from '../Organizations.generated';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const apiToken = 'apiToken';
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
      <ThemeProvider theme={theme}>
        <IntegrationsContextProvider apiToken={apiToken}>
          {children}
        </IntegrationsContextProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

const GetOrganizationsMock: Pick<
  Types.Organization,
  'apiClass' | 'id' | 'name' | 'oauth' | 'giftAidPercentage'
>[] = [
  {
    id: 'organizationId',
    name: 'organizationName',
    apiClass: 'OfflineOrg',
    oauth: false,
    giftAidPercentage: 0,
  },
  {
    id: 'ministryId',
    name: 'ministryName',
    apiClass: 'Siebel',
    oauth: false,
    giftAidPercentage: 80,
  },
  {
    id: 'loginId',
    name: 'loginName',
    apiClass: 'DataServer',
    oauth: false,
    giftAidPercentage: 70,
  },
  {
    id: 'oAuthId',
    name: 'oAuthName',
    apiClass: 'DataServer',
    oauth: true,
    giftAidPercentage: 60,
  },
];

const standardMocks = {
  GetOrganizations: {
    organizations: GetOrganizationsMock,
  },
};

const handleClose = jest.fn();
const refetchOrganizations = jest.fn();

describe('OrganizationAddAccountModal', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  let mocks = { ...standardMocks };

  beforeEach(() => {
    handleClose.mockClear();
    refetchOrganizations.mockClear();
    mocks = { ...standardMocks };
  });
  it('should render modal', async () => {
    const { getByText, getByTestId } = render(
      <Components>
        <GqlMockedProvider>
          <OrganizationAddAccountModal
            handleClose={handleClose}
            refetchOrganizations={refetchOrganizations}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    expect(getByText('Add Organization Account')).toBeInTheDocument();

    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should select offline Organization and add it', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            getOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <OrganizationAddAccountModal
            handleClose={handleClose}
            refetchOrganizations={refetchOrganizations}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'organizationName' }),
      ).toBeInTheDocument(),
    );

    await waitFor(() => {
      expect(getByText('Add Account')).not.toBeDisabled();
      userEvent.click(getByText('Add Account'));
    });
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} added your organization account',
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

  it('should select Ministry Organization and be unable to add it.', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            getOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <OrganizationAddAccountModal
            handleClose={handleClose}
            refetchOrganizations={refetchOrganizations}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(getByRole('option', { name: 'ministryName' })).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: 'ministryName' }));

    await waitFor(() => {
      expect(
        getByText('You must log into {{appName}} with your ministry email'),
      ).toBeInTheDocument();
      expect(getByText('Add Account')).toBeDisabled();
    });
  });

  it('should select Login Organization and add it.', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, getByTestId } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            getOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <OrganizationAddAccountModal
            handleClose={handleClose}
            refetchOrganizations={refetchOrganizations}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(getByRole('option', { name: 'loginName' })).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: 'loginName' }));

    await waitFor(() => {
      expect(getByText('Username')).toBeInTheDocument();
      expect(getByText('Password')).toBeInTheDocument();
      expect(getByText('Add Account')).toBeDisabled();
    });

    userEvent.type(
      getByRole('textbox', {
        name: /username/i,
      }),
      'MyUsername',
    );
    await waitFor(() => expect(getByText('Add Account')).toBeDisabled());
    userEvent.type(getByTestId('passwordInput'), 'MyPassword');

    await waitFor(() => expect(getByText('Add Account')).not.toBeDisabled());
    userEvent.click(getByText('Add Account'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        '{{appName}} added your organization account',
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
    const { getByText, getByRole } = render(
      <Components>
        <GqlMockedProvider<{
          GetOrganizations: GetOrganizationsQuery;
        }>
          mocks={{
            getOrganizations: {
              organizations: GetOrganizationsMock,
            },
          }}
          onCall={mutationSpy}
        >
          <OrganizationAddAccountModal
            handleClose={handleClose}
            refetchOrganizations={refetchOrganizations}
            accountListId={accountListId}
          />
        </GqlMockedProvider>
      </Components>,
    );

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(getByRole('option', { name: 'oAuthName' })).toBeInTheDocument(),
    );
    userEvent.click(getByRole('option', { name: 'oAuthName' }));

    await waitFor(() => {
      expect(
        getByText(
          "You will be taken to your organization's donation services system to grant {{appName}} permission to access your donation data.",
        ),
      ).toBeInTheDocument();
      expect(getByText('Connect')).toBeInTheDocument();
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
});
