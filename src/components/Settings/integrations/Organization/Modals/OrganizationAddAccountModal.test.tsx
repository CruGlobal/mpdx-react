import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import * as Types from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GetOrganizationsQuery } from '../Organizations.generated';
import { OrganizationAddAccountModal } from './OrganizationAddAccountModal';

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
  it('should render modal and not show disabled Orgs', async () => {
    const { getByText, getByTestId, getByRole, queryByRole } = render(
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

    userEvent.click(getByRole('combobox'));
    await waitFor(() =>
      expect(
        queryByRole('option', { name: 'Not Allowed Org Name' }),
      ).not.toBeInTheDocument(),
    );

    userEvent.click(getByText(/cancel/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
    userEvent.click(getByTestId('CloseIcon'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should select offline Organization and add it', async () => {
    const mutationSpy = jest.fn();
    const { getByText, getByRole, findByRole } = render(
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
    userEvent.click(await findByRole('option', { name: 'organizationName' }));

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
