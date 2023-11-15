import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import {
  GetUsersOrganizationsQuery,
  GetOrganizationsQuery,
} from './Organizations.generated';
import * as Types from '../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import { IntegrationsContextProvider } from 'pages/accountLists/[accountListId]/settings/integrations/IntegrationsContext';
import theme from '../../../../theme';
import TestRouter from '__tests__/util/TestRouter';
import { OrganizationAccordian } from './OrganizationAccordian';

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

const handleAccordionChange = jest.fn();

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

const GetOrganizationsMock: Pick<
  Types.Organization,
  'apiClass' | 'id' | 'name' | 'oauth' | 'giftAidPercentage'
>[] = [
  {
    id: 'organizationId',
    name: 'organizationName',
    apiClass: 'organizationApiClass',
    oauth: false,
    giftAidPercentage: 0,
  },
];

const GetUsersOrganizationsMock: Array<
  Pick<
    Types.OrganizationAccount,
    'latestDonationDate' | 'lastDownloadedAt' | 'username' | 'id'
  > & {
    organization: Pick<
      Types.Organization,
      'apiClass' | 'id' | 'name' | 'oauth'
    >;
  }
> = [
  {
    id: 'id',
    latestDonationDate: 'latestDonationDate',
    lastDownloadedAt: 'lastDownloadedAt',
    username: 'username',
    organization: {
      id: 'organizationId',
      name: 'organizationName',
      apiClass: 'OfflineOrg',
      oauth: false,
    },
  },
];

const standardMocks = {
  GetOrganizations: {
    organizations: GetOrganizationsMock,
  },
  GetUsersOrganizations: {
    userOrganizationAccounts: GetUsersOrganizationsMock,
  },
};

describe('OrganizationAccordian', () => {
  process.env.OAUTH_URL = 'https://auth.mpdx.org';
  it('should render accordian closed', async () => {
    const { getByText, queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <OrganizationAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>,
      ),
    );
    expect(getByText('Organization')).toBeInTheDocument();
    const image = queryByRole('img', {
      name: /Organization/i,
    });
    expect(image).not.toBeInTheDocument();
  });
  it('should render accordian open', async () => {
    const { queryByRole } = render(
      Components(
        <GqlMockedProvider>
          <OrganizationAccordian
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Organization'}
          />
        </GqlMockedProvider>,
      ),
    );
    const image = queryByRole('img', {
      name: /Organization/i,
    });
    expect(image).toBeInTheDocument();
  });

  describe('No Organizations connected', () => {
    it('should render Organization Overview', async () => {
      const { getByText } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={{
              GetOrganizations: {
                organizations: [],
              },
              GetUsersOrganizations: {
                userOrganizationAccounts: [],
              },
            }}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(
          getByText("Let's start by connecting to your first organization"),
        ).toBeInTheDocument();
      });
      userEvent.click(getByText('Add Account'));
      expect(getByText('Add Organization Account')).toBeInTheDocument();
    });
  });

  describe('Organizations connected', () => {
    let mocks = { ...standardMocks };
    beforeEach(() => {
      mocks = { ...standardMocks };
    });

    it('should render Offline Organization', async () => {
      const { getByText, queryByText } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      expect(
        queryByText("Let's start by connecting to your first organization"),
      ).not.toBeInTheDocument();

      await waitFor(() => {
        expect(
          getByText(GetUsersOrganizationsMock[0].organization.name),
        ).toBeInTheDocument();

        expect(getByText('Last Updated')).toBeInTheDocument();

        expect(getByText('Last Gift Date')).toBeInTheDocument();
      });

      userEvent.click(getByText('Import TntConnect DataSync file'));

      await waitFor(() => {
        expect(
          getByText(
            'To import your TntConnect database, go to Import from TntConnect',
          ),
        ).toBeInTheDocument();
      });
    });

    it('should render Ministry Account Organization', async () => {
      const mutationSpy = jest.fn();
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].organization.apiClass =
        'Siebel';
      const { getByText, queryByText } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText('Sync')).toBeInTheDocument();

        expect(
          queryByText('Import TntConnect DataSync file'),
        ).not.toBeInTheDocument();
      });

      userEvent.click(getByText('Sync'));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX started syncing your organization account. This will occur in the background over the next 24-hours.',
          {
            variant: 'success',
          },
        );
      });

      expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
        'SyncOrganizationAccount',
      );
      expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
        id: mocks.GetUsersOrganizations.userOrganizationAccounts[0].id,
      });
    });

    it('should render Login Organization', async () => {
      const mutationSpy = jest.fn();
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].organization.apiClass =
        'DataServer';
      const { getByText, getByTestId } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByText('Sync')).toBeInTheDocument();
        expect(getByTestId('EditIcon')).toBeInTheDocument();
      });

      userEvent.click(getByTestId('EditIcon'));

      await waitFor(() => {
        expect(getByText('Edit Organization Account')).toBeInTheDocument();
      });
    });

    it('should render OAuth Organization', async () => {
      const mutationSpy = jest.fn();
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].organization.apiClass =
        'DataServer';
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].organization.oauth =
        true;
      const { getByText, queryByTestId } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(queryByTestId('EditIcon')).not.toBeInTheDocument();
        expect(getByText('Sync')).toBeInTheDocument();
        expect(getByText('Reconnect')).toBeInTheDocument();
      });

      userEvent.click(getByText('Reconnect'));

      await waitFor(() => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Redirecting you to complete authenication to reconnect.',
          {
            variant: 'success',
          },
        );
      });
    });

    it('should delete Organization', async () => {
      const mutationSpy = jest.fn();
      const { getByText, getByTestId } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
            onCall={mutationSpy}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      await waitFor(() => {
        expect(getByTestId('DeleteIcon')).toBeInTheDocument();
      });

      userEvent.click(getByTestId('DeleteIcon'));

      await waitFor(() => {
        expect(
          getByText('Are you sure you wish to disconnect this organization?'),
        ).toBeInTheDocument();
      });
      userEvent.click(getByText('Yes'));

      await waitFor(() => {
        expect(mutationSpy.mock.calls[1][0].operation.operationName).toEqual(
          'DeleteOrganizationAccount',
        );
        expect(mutationSpy.mock.calls[1][0].operation.variables.input).toEqual({
          id: mocks.GetUsersOrganizations.userOrganizationAccounts[0].id,
        });
        expect(mockEnqueue).toHaveBeenCalledWith(
          'MPDX removed your organization integration',
          { variant: 'success' },
        );
      });
    });

    it("should not render Organization's download and last gift date", async () => {
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].lastDownloadedAt =
        null;
      mocks.GetUsersOrganizations.userOrganizationAccounts[0].latestDonationDate =
        null;
      const { queryByText } = render(
        Components(
          <GqlMockedProvider<{
            GetOrganizations: GetOrganizationsQuery;
            GetUsersOrganizations: GetUsersOrganizationsQuery;
          }>
            mocks={mocks}
          >
            <OrganizationAccordian
              handleAccordionChange={handleAccordionChange}
              expandedPanel={'Organization'}
            />
          </GqlMockedProvider>,
        ),
      );

      expect(queryByText('Last Updated')).not.toBeInTheDocument();

      expect(queryByText('Last Gift Date')).not.toBeInTheDocument();
    });
  });
});
